DROP TABLE IF EXISTS  BookList;

CREATE TABLE BookList (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    author VARCHAR(255),
    isbn VARCHAR(255),
    img VARCHAR(255),
    description TEXT
);

