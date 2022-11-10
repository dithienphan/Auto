CREATE SCHEMA IF NOT EXISTS AUTHORIZATION auto;

ALTER ROLE auto SET search_path = 'auto';

CREATE TABLE IF NOT EXISTS auto (
    id            char(36) PRIMARY KEY USING INDEX TABLESPACE autospace,
    version       integer NOT NULL DEFAULT 0,
    modell        varchar(40) NOT NULL UNIQUE USING INDEX TABLESPACE autospace,
    ps            integer NOT NULL CHECK (ps >= 0),
    art           varchar(12) NOT NULL CHECK (art ~ 'ELEKTRO|VERBRENNER'),
    hersteller    varchar(12) NOT NULL CHECK (hersteller ~ 'AUDI|BMW'),
    preis         decimal(8,2) NOT NULL,
    rabatt        decimal(4,3) NOT NULL,
    lieferbar     boolean NOT NULL DEFAULT FALSE,
    datum         date,
    homepage      varchar(40),
    modellNummer  varchar(16) NOT NULL UNIQUE USING INDEX TABLESPACE autospace,
    erzeugt       timestamp NOT NULL DEFAULT NOW(),
    aktualisiert  timestamp NOT NULL DEFAULT NOW()
) TABLESPACE autospace;

CREATE TABLE IF NOT EXISTS kategorie (
    id         char(36) PRIMARY KEY USING INDEX TABLESPACE autospace,
    auto_id    char(36) NOT NULL REFERENCES auto,
    kategorie  varchar(16) NOT NULL CHECK (kategorie ~ 'SUV|KOMBI')
) TABLESPACE autospace;

-- default: btree
CREATE INDEX IF NOT EXISTS kategorie_auto_id ON kategorie(auto_id) TABLESPACE autospace;
