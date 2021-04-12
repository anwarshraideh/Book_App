'use strict';

require('dotenv').config();
const express = require('express');
const server = express();
server.set('view engine','ejs');
server.use('/public', express.static('./public'));
server.use(express.urlencoded({extended:true}));
const superagent = require('superagent');



const PORT = process.env.PORT || 3000;



server.get('/hello',(req,res)=>{

    res.render('pages/index');
})


server.get('/searches/new',(req,res)=>{

    res.render('pages/searches/new')
})

server.post('/searches',(req,res)=>{ 
  
    let query = req.body.search;
    let search_by = req.body.searchBy;

    let url = `https://www.googleapis.com/books/v1/volumes?q=${query}+inauthor`;
    
    if (search_by === 'title'){

        url = `https://www.googleapis.com/books/v1/volumes?q=${query}+intitle`;
    }
    
    superagent.get(url)
        .then(data => {
            let bookArray = data.body.items.map(Element => new Book(Element));
            res.render('pages/searches/show', { booksData: bookArray });
        })

 })



function Book(Bookdata) {
    this.title = Bookdata.volumeInfo.title ;
    this.author = Bookdata.volumeInfo.authors;
    this.description = Bookdata.volumeInfo.description ;
    this.img = Bookdata.volumeInfo.imageLinks.thumbnail || 'https://i.imgur.com/J5LVHEL.jpg';
}



server.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`)
});

