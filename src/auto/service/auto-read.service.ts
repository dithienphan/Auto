import { Auto, type AutoArt, type Hersteller } from '../entity/auto.entity';
import { AutoValidationService } from './auto-validation.service.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { QueryBuilder } from './query-builder.js';
import { Repository } from 'typeorm';
import { getLogger } from '../../logger/logger.js';

export interface Suchkriterien {
    readonly version?: number;
    readonly modell?: string;
    readonly ps?: number;
    readonly art?: AutoArt;
    readonly hersteller?: Hersteller;
    readonly preis?: number;
    readonly rabatt?: number;
    readonly datum?: string;
    readonly modellNummer?: string;
    readonly homepage?: string;
    readonly kategorien?: string[];
}

/**
 * Die Klasse `AutoReadService` implementiert das Lesen für Autos und greift
 * mit _TypeORM_ auf eine relationale DB zu.
 */
@Injectable()
export class AutoReadService {
    readonly #autoRepository: Repository<Auto>;

    readonly #autoProps: string[];

    readonly #queryBuilder: QueryBuilder;

    readonly #validationService: AutoValidationService;

    readonly #logger = getLogger(AutoReadService.name);

    constructor(
        @InjectRepository(Auto) autoRepository: Repository<Auto>,
        queryBuilder: QueryBuilder,
        validationService: AutoValidationService,
    ) {
        this.#autoRepository = autoRepository;
        const auto = new Auto();
        this.#autoProps = Object.getOwnPropertyNames(auto);
        this.#queryBuilder = queryBuilder;
        this.#validationService = validationService;
    }

    /**
     * Ein Auto asynchron anhand seiner ID suchen
     * @param autoId ID des gesuchten Autos
     * @returns Das gefundene Auto vom Typ [Auto](auto_entity_auto_entity.auto.html) oder undefined
     *          in einem Promise aus ES2015 (vgl.: Mono aus Project Reactor oder
     *          Future aus Java)
     */
    async findById(autoId: string): Promise<Auto | undefined> {
        this.#logger.debug('findById: id=%s', autoId);

        if (!this.#validationService.validateId(autoId)) {
            this.#logger.debug('findById: Ungültige ID');
            return;
        }

        const auto = await this.#queryBuilder.buildId(autoId).getOne();
        if (auto === null) {
            this.#logger.debug('findById: Kein Auto gefunden');
            return;
        }

        this.#logger.debug('findById: auto=%o', auto);
        return auto;
    }

    /**
     * Autos asynchron suchen.
     * @param suchkriterien JSON-Objekt mit Suchkriterien
     * @returns Ein JSON-Array mit den gefundenen Büchern. Ggf. ist das Array leer.
     */
    async find(suchkriterien?: Suchkriterien): Promise<Auto[]> {
        this.#logger.debug('find: suchkriterien=%o', suchkriterien);

        // Keine Suchkriterien?
        if (suchkriterien === undefined) {
            return this.#findAll();
        }
        const keys: string[] = Object.keys(suchkriterien);
        if (keys.length === 0) {
            return this.#findAll();
        }

        // Falsche Namen fer Suchkriterien?
        if (!this.#checkKeys(keys)) {
            this.#logger.debug('find with Suchkriterien: search key not valid');
            return [];
        }

        const autos = await this.#queryBuilder.build(suchkriterien).getMany();
        this.#logger.debug('find: autos=%o', autos);

        return autos;
    }

    async #findAll() {
        const autos = await this.#autoRepository.find();
        this.#logger.debug('#findAll: alle autos=%o', autos);
        return autos;
    }

    #checkKeys(keys: string[]) {
        // Ist jedes Suchkriterium auch eine Property von Auto oder "Kriterien"?
        let validKeys = true;
        keys.forEach((key: string) => {
            if (!this.#autoProps.includes(key)) {
                this.#logger.debug('#find: ungültiges Suchkriterium "%s"', key);
                validKeys = false;
            }
        });

        return validKeys;
    }
}
