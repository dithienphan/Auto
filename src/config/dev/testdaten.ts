/* eslint-disable @typescript-eslint/no-non-null-assertion */
/*
 * Copyright (C) 2020 - present Juergen Zimmermann, Hochschule Karlsruhe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { type Auto } from '../../auto/entity/auto.entity.js';
import { type Kategorie } from './../../auto/entity/kategorie.entity.js';

// TypeORM kann keine SQL-Skripte ausfuehren

export const autos: Auto[] = [
    // -------------------------------------------------------------------------
    // L e s e n
    // -------------------------------------------------------------------------
    {
        id: '00000000-0000-0000-0000-000000000001',
        version: 0,
        titel: 'Alpha',
        rating: 4,
        art: 'DRUCKAUSGABE',
        verlag: 'FOO_VERLAG',
        preis: 11.1,
        rabatt: 0.011,
        lieferbar: true,
        datum: new Date('2022-02-01'),
        // "Konzeption und Realisierung eines aktiven Datenbanksystems"
        isbn: '9783897225831',
        homepage: 'https://acme.at/',
        kategorien: [],
        erzeugt: new Date('2022-02-01'),
        aktualisiert: new Date('2022-02-01'),
    },
    {
        id: '00000000-0000-0000-0000-000000000002',
        version: 0,
        titel: 'Beta',
        rating: 2,
        art: 'KINDLE',
        verlag: 'BAR_VERLAG',
        preis: 22.2,
        rabatt: 0.022,
        lieferbar: true,
        datum: new Date('2022-02-02'),
        // "Verteilte Komponenten und Datenbankanbindung"
        isbn: '9783827315526',
        homepage: 'https://acme.biz/',
        kategorien: [],
        erzeugt: new Date('2022-02-02'),
        aktualisiert: new Date('2022-02-02'),
    },
    {
        id: '00000000-0000-0000-0000-000000000003',
        version: 0,
        titel: 'Gamma',
        rating: 1,
        art: 'DRUCKAUSGABE',
        verlag: 'FOO_VERLAG',
        preis: 33.3,
        rabatt: 0.033,
        lieferbar: true,
        datum: new Date('2022-02-03'),
        // "Design Patterns"
        isbn: '9780201633610',
        homepage: 'https://acme.com/',
        kategorien: [],
        erzeugt: new Date('2022-02-03'),
        aktualisiert: new Date('2022-02-03'),
    },
    // -------------------------------------------------------------------------
    // A e n d e r n
    // -------------------------------------------------------------------------
    {
        id: '00000000-0000-0000-0000-000000000040',
        version: 0,
        titel: 'Delta',
        rating: 3,
        art: 'DRUCKAUSGABE',
        verlag: 'BAR_VERLAG',
        preis: 44.4,
        rabatt: 0.044,
        lieferbar: true,
        datum: new Date('2022-02-04'),
        // "Freiburger Chorauto"
        isbn: '0007097328',
        homepage: 'https://acme.de/',
        kategorien: [],
        erzeugt: new Date('2022-02-04'),
        aktualisiert: new Date('2022-02-04'),
    },
    // -------------------------------------------------------------------------
    // L o e s c h e n
    // -------------------------------------------------------------------------
    {
        id: '00000000-0000-0000-0000-000000000050',
        version: 0,
        titel: 'Epsilon',
        rating: 2,
        art: 'KINDLE',
        verlag: 'FOO_VERLAG',
        preis: 55.5,
        rabatt: 0.055,
        lieferbar: true,
        datum: new Date('2022-02-05'),
        // "Maschinelle Lernverfahren zur Behandlung von Bonitätsrisiken im Mobilfunkgeschäft"
        isbn: '9783824404810',
        homepage: 'https://acme.es/',
        kategorien: [],
        erzeugt: new Date('2022-02-05'),
        aktualisiert: new Date('2022-02-05'),
    },
    {
        id: '00000000-0000-0000-0000-000000000060',
        version: 0,
        titel: 'Phi',
        rating: 2,
        art: 'KINDLE',
        verlag: 'FOO_VERLAG',
        preis: 66.6,
        rabatt: 0.066,
        lieferbar: true,
        datum: new Date('2022-02-06'),
        // "Software pioneers",
        isbn: '9783540430810',
        homepage: 'https://acme.it/',
        kategorien: [],
        erzeugt: new Date('2022-02-06'),
        aktualisiert: new Date('2022-02-06'),
    },
];

export const kategorien: kategorie[] = [
    {
        id: '00000000-0000-0000-0000-010000000001',
        auto: autos[0],
        kategorie: 'JAVASCRIPT',
    },
    {
        id: '00000000-0000-0000-0000-020000000001',
        auto: autos[1],
        kategorie: 'TYPESCRIPT',
    },
    {
        id: '00000000-0000-0000-0000-030000000001',
        auto: autos[2],
        kategorie: 'JAVASCRIPT',
    },
    {
        id: '00000000-0000-0000-0000-030000000002',
        auto: autos[2],
        kategorie: 'TYPESCRIPT',
    },
    {
        id: '00000000-0000-0000-0000-500000000001',
        auto: autos[4],
        kategorie: 'TYPESCRIPT',
    },
    {
        id: '00000000-0000-0000-0000-600000000001',
        auto: autos[5],
        kategorie: 'TYPESCRIPT',
    },
];

autos[0]!.kategorien.push(kategorien[0]!);
autos[1]!.kategorien.push(kategorien[1]!);
autos[2]!.kategorien.push(kategorien[2]!, kategorien[3]!);
autos[4]!.kategorien.push(kategorien[4]!);
autos[5]!.kategorien.push(kategorien[5]!);

/* eslint-enable @typescript-eslint/no-non-null-assertion */
