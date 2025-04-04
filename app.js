const http = require('http');
const express = require('express');
const fs = require('fs');
const nativePath = require('path');
const app  = express();
const cors = require('cors');
const  mongoConnect = require('./util/database');
const bodyParser = require('body-parser');

require('dotenv').config();

app.use(bodyParser.json()); //specifically parse json formatted req bodies
app.use(cors());


mongoConnect(() => {
    app.listen(4000, () => {
        console.log('Server listening on port 4000');
    });
});
