const express = require('express');
const app = express();
const logger = require('./middleware/logger');
const routes = require('./routes/shorturlRoutes');

app.use(express.json());
app.use(logger);
// app.use('/shorturls', shorturlRoutes);
app.use('/', routes);
app.get('/', (req, res) => {
    res.send(' URL Shortener API is running');
});

module.exports = app;
