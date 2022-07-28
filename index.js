require('dotenv').config();
const PORT = 3000;
const express = require('express');
const server = express();

const apiRouter = require('./api');
server.use('/api', apiRouter);



const morgan = require('morgan');
server.use(morgan('dev'));

server.use(express.json())

const { client } = require('./db');

client.connect();
server.listen(PORT, () => {
  console.log('The server is up on port', PORT)
});



