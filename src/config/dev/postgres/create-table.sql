CREATE SCHEMA IF NOT EXISTS AUTHORIZATION auto;

ALTER ROLE auto SET search_path = 'auto';

CREATE TABLE IF NOT EXISTS auto (
    id            char(36) PRIMARY KEY USING INDEX TABLESPACE autospace,
    version       integer NOT NULL DEFAULT 0,
<<<<<<< HEAD
    modell        varchar(40) NOT NULL UNIQUE USING INDEX TABLESPACE autospace,
    ps            integer NOT NULL CHECK (ps >= 0),
    art           varchar(12) NOT NULL CHECK (art ~ 'ELEKTRO|VERBRENNER'),
    hersteller    varchar(12) NOT NULL CHECK (hersteller ~ 'AUDI|BMW'),
=======
                  -- impliziter Index als B-Baum durch UNIQUE
                  -- https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-UNIQUE-CONSTRAINTS
    modell         varchar(40) NOT NULL UNIQUE USING INDEX TABLESPACE autospace,
                  -- https://www.postgresql.org/docs/current/ddl-constraints.html#id-1.5.4.6.6
                  -- https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-CHECK-CONSTRAINTS
    ps        integer NOT NULL CHECK (ps >= 0),
                  -- https://www.postgresql.org/docs/current/functions-matching.html#FUNCTIONS-POSIX-REGEXP
    art           varchar(12) NOT NULL CHECK (art ~ 'ELEKTRO|VERBRENNER'),
    hersteller        varchar(12) NOT NULL CHECK (auto.hersteller ~ 'AUDI|BMW'),
                  -- https://www.postgresql.org/docs/current/datatype-numeric.html#DATATYPE-NUMERIC-DECIMAL
                  -- 10 Stellen, davon 2 Nachkommastellen
>>>>>>> f148e1c4af18f0972f5a3f849288129337db0ba5
    preis         decimal(8,2) NOT NULL,
    rabatt        decimal(4,3) NOT NULL,
    lieferbar     boolean NOT NULL DEFAULT FALSE,
    datum         date,
    homepage      varchar(40),
<<<<<<< HEAD
    modellNummer  varchar(16) NOT NULL UNIQUE USING INDEX TABLESPACE autospace,
=======
    modellnummer          varchar(16) NOT NULL UNIQUE USING INDEX TABLESPACE autospace,
                  -- https://www.postgresql.org/docs/current/datatype-datetime.html
>>>>>>> f148e1c4af18f0972f5a3f849288129337db0ba5
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
