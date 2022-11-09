/*
 * Copyright (C) 2016 - present Juergen Zimmermann, Hochschule Karlsruhe
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

import { afterAll, beforeAll, describe, test } from '@jest/globals';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import {
    host,
    httpsAgent,
    port,
    shutdownServer,
    startServer,
} from '../testserver.js';
import { type AutoDTO } from '../../src/auto/rest/auto-write.controller.js';
import { HttpStatus } from '@nestjs/common';
import { ID_PATTERN } from '../../src/auto/service/auto-validation.service.js';
import { loginRest } from '../login.js';

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const neuesAuto: AutoDTO = {
    modell: 'Testrest',
    ps: 1,
    art: 'VERBRENNER',
    hersteller: 'AUDI',
    preis: 99.99,
    rabatt: 0.099,
    lieferbar: true,
    datum: '2022-02-28',
    modellNummer: '9780007006441',
    homepage: 'https://test.de/',
    kategorien: ['SUV', 'KOMBI'],
};
const neuesAutoInvalid: Record<string, unknown> = {
    modell: '!?$',
    ps: -1,
    art: 'UNSICHTBAR',
    hersteller: 'NO_HERSTELLER',
    preis: 0,
    rabatt: 2,
    lieferbar: true,
    datum: '12345123123',
    modellNummer: 'falsche-modellNummer',
    kategorien: [],
};
const neuesAutoModellExistiert: AutoDTO = {
    modell: 'Alpha',
    ps: 1,
    art: 'VERBRENNER',
    hersteller: 'AUDI',
    preis: 99.99,
    rabatt: 0.099,
    lieferbar: true,
    datum: '2022-02-28',
    modellNummer: '9780007097326',
    homepage: 'https://test.de/',
    kategorien: ['SUV', 'KOMBI'],
};

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
// Test-Suite
// eslint-disable-next-line max-lines-per-function
describe('POST /', () => {
    let client: AxiosInstance;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
    };

    // Testserver starten und dabei mit der DB verbinden
    beforeAll(async () => {
        await startServer();
        const baseURL = `https://${host}:${port}`;
        client = axios.create({
            baseURL,
            httpsAgent,
            validateStatus: (status) => status < 500, // eslint-disable-line @typescript-eslint/no-magic-numbers
        });
    });

    // (done?: DoneFn) => Promise<void | undefined | unknown> | void | undefined
    // close(callback?: (err?: Error) => void): this
    afterAll(async () => {
        await shutdownServer();
    });

    test('Neues Auto', async () => {
        // given
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;

        // when
        const response: AxiosResponse<string> = await client.post(
            '/',
            neuesAuto,
            { headers },
        );

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.CREATED);

        const { location } = response.headers as { location: string };

        expect(location).toBeDefined();

        // ObjectID: Muster von HEX-Ziffern
        const indexLastSlash: number = location.lastIndexOf('/');

        expect(indexLastSlash).not.toBe(-1);

        const idStr = location.slice(indexLastSlash + 1);

        expect(idStr).toBeDefined();
        expect(ID_PATTERN.test(idStr)).toBe(true);

        expect(data).toBe('');
    });

    test('Neues Auto mit ungueltigen Daten', async () => {
        // given
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;

        // when
        const response: AxiosResponse<string> = await client.post(
            '/',
            neuesAutoInvalid,
            { headers },
        );

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(data).toEqual(
            expect.arrayContaining([
                'Ein Automodell muss mit einem Autostaben, einer Ziffer oder _ beginnen.',
                'Die PS muss über 0 liegen.',
                'Die Art eines Autos muss VERBRENNER oder VERBRENNER sein.',
                'Der Hersteller eines Autoes muss AUDI oder BMW sein.',
                'Der Rabatt muss ein Wert zwischen 0 und 1 sein.',
                'Das Datum muss im Format yyyy-MM-dd sein.',
                'Die modellNummer-Nummer ist nicht korrekt.',
            ]),
        );
    });

    test('Neues Auto, aber der Modell existiert bereits', async () => {
        // given
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;

        // when
        const response: AxiosResponse<string> = await client.post(
            '/',
            neuesAutoModellExistiert,
            { headers },
        );

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(data).toEqual(expect.stringContaining('Modell'));
    });

    test('Neues Auto, aber ohne Token', async () => {
        // when
        const response: AxiosResponse<Record<string, any>> = await client.post(
            '/',
            neuesAuto,
        );

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.FORBIDDEN);
        expect(data.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    test('Neues Auto, aber mit falschem Token', async () => {
        // given
        const token = 'FALSCH';
        headers.Authorization = `Bearer ${token}`;

        // when
        const response: AxiosResponse<Record<string, any>> = await client.post(
            '/',
            neuesAuto,
            { headers },
        );

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.FORBIDDEN);
        expect(data.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    test.todo('Abgelaufener Token');
});
