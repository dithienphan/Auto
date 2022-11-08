import {
    type AutoNotExists,
    type CreateError,
    type UpdateError,
    type VersionExists,
    type VersionInvalid,
    type VersionOutdated,
} from './errors.js';
import { type DeleteResult, Repository } from 'typeorm';
import { Auto } from '../entity/auto.entity.js';
import { AutoReadService } from './auto-read.service.js';
import { AutoValidationService } from './auto-validation.service.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Kategorie } from '../entity/kategorie.entity.js';
import { MailService } from '../../mail/mail.service.js';
import RE2 from 're2';
import { getLogger } from '../../logger/logger.js';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AutoWriteService {
    private static readonly VERSION_PATTERN = new RE2('^"\\d*"');

    readonly #autoRepository: Repository<Auto>;

    readonly #autoReadService: AutoReadService;

    readonly #autoValidationService: AutoValidationService;

    readonly #mailService: MailService;

    readonly #logger = getLogger(AutoWriteService.name);

    // eslint-disable-next-line max-params
    constructor(
        @InjectRepository(Auto) autoRepository: Repository<Auto>,
        autoReadService: AutoReadService,
        autoValidationService: AutoValidationService,
        mailService: MailService,
    ) {
        this.#autoRepository = autoRepository;
        this.#autoReadService = autoReadService;
        this.#autoValidationService = autoValidationService;
        this.#mailService = mailService;
    }

    async create(auto: Auto): Promise<CreateError | string> {
        this.#logger.debug('create: auto=%o', auto);
        const validateResult = await this.#validateCreate(auto);
        if (validateResult !== undefined) {
            return validateResult;
        }

        auto.id = uuid(); // eslint-disable-line require-atomic-updates
        auto.kategorien.forEach((kategorie: Kategorie) => {
            kategorie.id = uuid();
        });

        // implizite Transaktion
        const autoDb = await this.#autoRepository.save(auto);
        this.#logger.debug('create: AutoDb=%o', autoDb);

        await this.#sendmail(autoDb);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return autoDb.id!;
    }

    /**
     * Ein vorhandenes Auto soll aktualisiert werden.
     * @param auto Das zu aktualisierende Auto
     * @param id ID des zu aktualisierenden Autos
     * @param version Die Versionsnummer für optimistische Synchronisation
     * @returns Die neue Versionsnummer gemäß optimistischer Synchronisation
     *  oder im Fehlerfall [UpdateError](../types/auto_service_errors.UpdateError.html)
     */
    async update(
        id: string | undefined,
        auto: Auto,
        version: string,
    ): Promise<UpdateError | number> {
        this.#logger.debug(
            'update: id=%s, auto=%o, version=%s',
            id,
            auto,
            version,
        );
        if (id === undefined || !this.#autoValidationService.validateId(id)) {
            this.#logger.debug('update: Keine gültige ID');
            return { type: 'AutoNotExists', id };
        }

        const validateResult = await this.#validateUpdate(auto, id, version);
        this.#logger.debug('update: validateResult=%o', validateResult);
        if (!(validateResult instanceof Auto)) {
            return validateResult;
        }

        const merged = this.#autoRepository.merge(validateResult, auto);
        this.#logger.debug('update: merged=%o', merged);
        const updated = await this.#autoRepository.save(merged);
        this.#logger.debug('update: updated=%o', updated);

        return updated.version!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    }

    /**
     * Ein Auto wird asynchron anhand seiner ID gelöscht.
     *
     * @param autoId ID des zu löschenden Auto
     * @returns true, falls das Auto vorhanden war und gelöscht wurde. Sonst false.
     */
    async delete(autoId: string): Promise<boolean> {
        this.#logger.debug('delete: id=%s', autoId);
        if (!this.#autoValidationService.validateId(autoId)) {
            this.#logger.debug('delete: Keine gültige ID');
            return false;
        }

        const auto = await this.#autoReadService.findById(autoId);
        if (auto === undefined) {
            return false;
        }

        let deleteResult: DeleteResult | undefined;
        await this.#autoRepository.manager.transaction(
            async (transactionalMgr) => {
                const { kategorien } = auto;
                const kategorienIdList = kategorien.map(
                    (kategorie: Kategorie) => kategorie.id,
                );
                const deleteResultKategorien = await transactionalMgr.delete(
                    Kategorie,
                    kategorienIdList,
                );
                this.#logger.debug(
                    'delete: deleteResultKategorien=%o',
                    deleteResultKategorien,
                );
                deleteResult = await transactionalMgr.delete(Auto, autoId);
                this.#logger.debug('delete: deleteResult=%o', deleteResult);
            },
        );

        return (
            deleteResult?.affected !== undefined &&
            deleteResult.affected !== null &&
            deleteResult.affected > 0
        );
    }

    async #validateCreate(auto: Auto): Promise<CreateError | undefined> {
        const validateResult = this.#autoValidationService.validate(auto);
        if (validateResult !== undefined) {
            const messages = validateResult;
            this.#logger.debug('#validateCreate: messages=%o', messages);
            return { type: 'ConstraintViolations', messages };
        }

        const { version } = auto;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        let autos = await this.#autoReadService.find({ version: version! });
        if (autos.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return { type: 'VersionExists', version: version! };
        }

        const { modellNummer } = auto;
        autos = await this.#autoReadService.find({
            modellNummer,
        });

        if (autos.length > 0) {
            return { type: 'ModellNummerExists', modellNummer };
        }

        this.#logger.debug('#validateCreate: ok');
        return undefined;
    }

    async #sendmail(auto: Auto) {
        const subject = `Neues Auto ${auto.id}`;
        const body = `Das Auto mit vom Hersteller <strong>${auto.hersteller}</strong> ist angelegt worden`;
        await this.#mailService.sendmail(subject, body);
    }

    async #validateUpdate(
        auto: Auto,
        id: string,
        versionStr: string,
    ): Promise<Auto | UpdateError> {
        const result = this.#validateVersion(versionStr);
        if (typeof result !== 'number') {
            return result;
        }

        const version = result;
        this.#logger.debug(
            '#validateUpdate: auto=%o, version=%s',
            auto,
            version,
        );

        const validateResult = this.#autoValidationService.validate(auto);
        if (validateResult !== undefined) {
            const messages = validateResult;
            this.#logger.debug('#validateUpdate: messages=%o', messages);
            return { type: 'ConstraintViolations', messages };
        }

        const resultVersion = await this.#checkVersionExists(auto);
        if (resultVersion !== undefined && resultVersion.id !== id) {
            return resultVersion;
        }

        const resultFindById = await this.#findByIdAndCheckVersion(id, version);
        this.#logger.debug('#validateUpdate: %o', resultFindById);
        return resultFindById;
    }

    #validateVersion(version: string | undefined): VersionInvalid | number {
        if (
            version === undefined ||
            !AutoWriteService.VERSION_PATTERN.test(version)
        ) {
            const error: VersionInvalid = { type: 'VersionInvalid', version };
            this.#logger.debug('#validateVersion: VersionInvalid=%o', error);
            return error;
        }

        return Number.parseInt(version.slice(1, -1), 10);
    }

    async #checkVersionExists(auto: Auto): Promise<VersionExists | undefined> {
        const { version } = auto;

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const autos = await this.#autoReadService.find({ version: version! });
        if (autos.length > 0) {
            const [gefundenesAuto] = autos;
            const { id } = gefundenesAuto!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
            this.#logger.debug('#checkVersionExists: id=%s', id);
            return { type: 'VersionExists', version, id: id! }; // eslint-disable-line @typescript-eslint/no-non-null-assertion
        }

        this.#logger.debug('#checkVersionExists: ok');
        return undefined;
    }

    async #findByIdAndCheckVersion(
        id: string,
        version: number,
    ): Promise<Auto | AutoNotExists | VersionOutdated> {
        const autoDb = await this.#autoReadService.findById(id);
        if (autoDb === undefined) {
            const result: AutoNotExists = { type: 'AutoNotExists', id };
            this.#logger.debug(
                '#findByIdAndCheckVersion: AutoNotExists=%o',
                result,
            );
            return result;
        }

        // nullish coalescing
        const versionDb = autoDb.version!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
        if (version < versionDb) {
            const result: VersionOutdated = {
                type: 'VersionOutdated',
                id,
                version,
            };
            this.#logger.debug(
                '#findByIdAndCheckVersion: VersionOutdated=%o',
                result,
            );
            return result;
        }

        return autoDb;
    }
}
