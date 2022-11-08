/**
 * Das Modul besteht aus den Klassen für die Fehlerbehandlung bei der Verwaltung
 * von Büchern, z.B. beim DB-Zugriff.
 * @packageDocumentation
 */

/**
 * Klasse für fehlerhafte Autodaten. Die Meldungstexte sind in der Property
 * `msg` gekapselt.
 */
export interface ConstraintViolations {
    readonly type: 'ConstraintViolations';
    readonly messages: string[];
}

/**
 * Klasse für einen bereits existierende Version.
 */
export interface VersionExists {
    readonly type: 'VersionExists';
    readonly version: number | null | undefined;
    readonly id?: string;
}

/**
 * Klasse für eine bereits existierende modell-Nummer.
 */
export interface ModellNummerExists {
    readonly type: 'ModellNummerExists';
    readonly modellNummer: string | null | undefined;
    readonly id?: string;
}

export type CreateError =
    | ConstraintViolations
    | ModellNummerExists
    | VersionExists;

/**
 * Klasse für eine ungültige Versionsnummer beim Ändern.
 */
export interface VersionInvalid {
    readonly type: 'VersionInvalid';
    readonly version: string | undefined;
}

/**
 * Klasse für eine veraltete Versionsnummer beim Ändern.
 */
export interface VersionOutdated {
    readonly type: 'VersionOutdated';
    readonly id: string;
    readonly version: number;
}

/**
 * Klasse für ein nicht-vorhandenes Auto beim Ändern.
 */
export interface AutoNotExists {
    readonly type: 'AutoNotExists';
    readonly id: string | undefined;
}

export type UpdateError =
    | AutoNotExists
    | ConstraintViolations
    | VersionExists
    | VersionInvalid
    | VersionOutdated;

/**
 * Klasse für eine nicht-vorhandene Binärdatei.
 */
export interface FileNotFound {
    readonly type: 'FileNotFound';
    readonly filename: string;
}

/**
 * Klasse, falls es mehrere Binärdateien zu einem Auto gibt.
 */
export interface MultipleFiles {
    readonly type: 'MultipleFiles';
    readonly filename: string;
}

/**
 * Klasse, falls der ContentType nicht korrekt ist.
 */
export interface InvalidContentType {
    readonly type: 'InvalidContentType';
}

export type FileFindError =
    | AutoNotExists
    | FileNotFound
    | InvalidContentType
    | MultipleFiles;
