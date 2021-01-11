const express = require("express");
const app = express();
const routes = require('./routes.js');

const path = require("path");

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));
app.get('/',routes);
// app.post('/register',routes);

app.get('/success',routes);
app.get('/addPost',routes);
app.post('/addPost',routes);
// app.post('/shortUrls',routes);
// app.get('/:shortUrl',routes);

app.listen(process.env.PORT || 3000 , ()=>console.log("SERVER STARTED"));