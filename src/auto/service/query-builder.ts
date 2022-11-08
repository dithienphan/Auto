import { FindOptionsUtils, Repository, type SelectQueryBuilder } from 'typeorm';
import { Auto } from '../entity/auto.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { getLogger } from '../../logger/logger.js';
import { typeOrmModuleOptions } from '../../config/db.js';

@Injectable()
export class QueryBuilder {
    readonly #autoAlias = `${Auto.name
        .charAt(0)
        .toLowerCase()}${Auto.name.slice(1)}`;

    readonly #repo: Repository<Auto>;

    readonly #logger = getLogger(QueryBuilder.name);

    constructor(@InjectRepository(Auto) repo: Repository<Auto>) {
        this.#repo = repo;
    }

    buildId(id: string) {
        const queryBuilder = this.#repo.createQueryBuilder(this.#autoAlias);

        FindOptionsUtils.joinEagerRelations(
            queryBuilder,
            queryBuilder.alias,
            this.#repo.metadata,
        );

        queryBuilder.where(`${this.#autoAlias}.id = :id`, { id: id }); // eslint-disable-line object-shorthand
        return queryBuilder;
    }

    build(suchkriterien: Record<string, any>) {
        this.#logger.debug('build: suchkriterien=%o', suchkriterien);

        let queryBuilder = this.#repo.createQueryBuilder(this.#autoAlias);

        FindOptionsUtils.joinEagerRelations(
            queryBuilder,
            queryBuilder.alias,
            this.#repo.metadata,
        );
        const { version, modell, hersteller, preis, kategorien, ...props } =
            suchkriterien;

        queryBuilder = this.#buildKategorie(
            queryBuilder,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            kategorien,
        );
        let useWhere = true;
        if (version !== undefined && typeof version === 'number') {
            const iLike =
                typeOrmModuleOptions.type === 'postgres' ? 'ilike' : 'like';
            queryBuilder = queryBuilder.where(
                `${this.#autoAlias}.version ${iLike} :version`,
                { version: `%${version}%` },
            );
            useWhere = false;
        }
        // type-coverage:ignore-next-line
        if (hersteller !== undefined && typeof hersteller === 'string') {
            const param = {
                hersteller,
            };
            queryBuilder = useWhere
                ? queryBuilder.where(
                      `${this.#autoAlias}.hersteller = :hersteller`,
                      param,
                  )
                : queryBuilder.andWhere(
                      `${this.#autoAlias}.hersteller = :hersteller`,
                      param,
                  );
        }

        Object.keys(props).forEach((key: string) => {
            const param: Record<string, any> = {};
            param[key] = props[key]; // eslint-disable-line @typescript-eslint/no-unsafe-assignment, security/detect-object-injection
            queryBuilder = useWhere
                ? queryBuilder.where(
                      `${this.#autoAlias}.${key} = :${key}`,
                      param,
                  )
                : queryBuilder.andWhere(
                      `${this.#autoAlias}.${key} = :${key}`,
                      param,
                  );
        });
        this.#logger.debug('build: sql=%s', queryBuilder.getSql());
        return queryBuilder;
    }

    #buildKategorie(
        queryBuilder: SelectQueryBuilder<Auto>,
        kategorien: string[],
    ) {
        if (kategorien.length > 0) {
            kategorien.forEach((kategorie: string) => {
                // eslint-disable-next-line no-param-reassign
                queryBuilder = queryBuilder.innerJoinAndSelect(
                    `${this.#autoAlias}.kategorien`,
                    'kategorien',
                    'kategorien.kategorien = :kategorie',
                    { kategorie },
                );
            });
        }
        return queryBuilder;
    }
}
