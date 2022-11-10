CREATE TABLE IF NOT EXISTS kategorie (
    id         CHAR(36) NOT NULL PRIMARY KEY,
    auto_id    CHAR(36) NOT NULL REFERENCES auto,
    kategorie VARCHAR(16) NOT NULL CHECK (kategorie = 'SUV' OR kategorie = 'KOMBI'),

    INDEX kategorie_auto_id(auto_id)
) TABLESPACE autospace ROW_FORMAT=COMPACT;