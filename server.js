'use strict';

require('dotenv').config();
const express = require('express');
const server = express();
server.set('view engine','ejs');
server.use('/public', express.static('./public'));


const PORT = process.env.PORT || 3000;



server.get('/hello',(req,res)=>{

    res.render('pages/index');
})


server.get('/searches/new',(req,res)=>{

    res.render('pages/searches/new')
})



server.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`)
});
