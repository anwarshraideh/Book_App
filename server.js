'use strict';

require('dotenv').config();
const express = require('express');
const server = express();
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');


server.set('view engine', 'ejs');
server.use('/public', express.static('./public'));
server.use(express.urlencoded({ extended: true }));
server.use(methodOverride('_method'));


const PORT = process.env.PORT || 3000;
//const client = new pg.Client(process.env.DATABASE_URL);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });




server.get('/', (req, res) => {
    let SQL = `SELECT * FROM BookList;`;
    client.query(SQL)

        .then(allBooks => {

            res.render('pages/index', { bkList: allBooks.rows });

        })

        .catch(error => {
            res.render('pages/error', { errors: error });
        });


})


// server.get('/hello',(req,res)=>{

//     res.render('pages/index');
// })


server.get('/searches/new', (req, res) => {

    res.render('pages/searches/new')
})

server.post('/searches', (req, res) => {

    let search_query = req.body.seachQuery;
    let search_by = req.body.searchBy

    let url = `https://www.googleapis.com/books/v1/volumes?q=+inauthor:${search_query}`;

    if (search_by === 'title') {

        url = `https://www.googleapis.com/books/v1/volumes?q=+intitle:${search_query}`;

    }


    superagent.get(url)
        .then(data => {
            let bookArray = data.body.items.map(Element => new Book(Element));
            res.render('pages/searches/show', { booksData: bookArray });
        })

        .catch(error => {
            res.render('pages/error', { errors: error });
        });

})


server.get('/books/:id', (req, res) => {

    
    let SQL = `SELECT * FROM BookList WHERE id = $1;`;
    let secureValue = [req.params.id];

    client.query(SQL , secureValue)
        .then(result => {
            res.render('pages/books/show', { book: result.rows[0] })
        })
        .catch((error) => {
            console.log(`error!`, error);
        })

})

server.put('/updateBook/:id', (req, res) => {

    let SQL = `UPDATE BookList SET title=$1, author=$2, isbn=$3, img=$4 , description=$5 WHERE id=$6;`;
    let values = [req.body.title, req.body.author, req.body.isbn, req.body.img, req.body.description,req.params.id];
    client.query(SQL, values)
        .then(() => {
            res.redirect(`/books/${req.params.id}`);
        })
        .catch(() => {
            console.log(`Sorry, error editing this book!`);
        })

})

server.delete('/deleteBook/:id', (req, res) => {

    let SQL = `DELETE FROM BookList WHERE id=$1;`;
    let value = [req.params.id];
    client.query(SQL, value)
        .then(() => {
            res.redirect(`/`);
        })
        .catch(() => {
            console.log(`Sorry, error deleting this book!`);
        })

})



server.post('/books', (req, res) => {

    let SQL = `INSERT INTO BookList (title, author, isbn , img , description )
    VALUES($1,$2,$3,$4,$5) RETURNING *;`;
    let values = [req.body.title, req.body.author, req.body.isbn, req.body.img , req.body.description];
    client.query(SQL, values)
        .then(result => {
            res.redirect(`/books/${result.rows[0].id}`);
        })
        .catch((error) => {
            console.log(`error!`, error);
        })
})



function Book(Bookdata) {
    this.title = Bookdata.volumeInfo.title || 'Title unavilable';
    this.author = Bookdata.volumeInfo.authors || `Author unavilable`;
    this.description = Bookdata.volumeInfo.description || `description unavilable`;
    this.img = (Bookdata.volumeInfo.imageLinks) ? Bookdata.volumeInfo.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
    this.isbn = (Bookdata.volumeInfo.industryIdentifiers) ? Bookdata.volumeInfo.industryIdentifiers[0].identifier : `Unknown ISBN`;

}


client.connect().then(() => {
    server.listen(PORT, () => {
        console.log(`Listening on PORT ${PORT}`)
    });

});