const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const PORT = process.env.PORT || 3100;

//custom middleware logger
app.use(logger);

//cross origin resource sharing
const whitelist = [`http://localhost:${PORT}`, 'www.google.com'];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            callback(null, true)
        } else {
            callback(new Error(`Not allowed by CORS. Origin: ${origin}`)); 
        }
    },
    optionsSuccessStatus: 200
}

//You can either pass cors options as a parameter in cors or pass a url
app.use(cors(corsOptions));

//Built in middlewares to handle urlencoder data
app.use(express.urlencoded({ extended: false }));

//built-in middleware for json
app.use(express.json());

//serve static files
app.use(express.static(path.join(__dirname, '/public')));

app.get('^/$|/index(.html)?', (req, res) => {
    // res.sendFile('./views/index.html', { root: __dirname });
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
})

app.get('/new-page(.html)?', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'new-page.html'));
})

app.get('/old-page(.html)?', (req, res) => {
    res.redirect(301, '/new-page.html'); //302 by default
})

//Route handlers
app.get('/hello(.html)?', (req, res, next) => {
    console.log('attempted to load hellow.html');
    next()
}, (req, res) => {
    res.send('Hello World!');
})

// chaining route handlers
const one = (req, res, next) => {
    console.log('one');
    next();
}

const two = (req, res, next) => {
    console.log('two');
    next();
}

const three = (req, res, next) => {
    console.log('three');
    res.send('Finished');
}

app.get('/chain(.html)?', [one, two, three]);

app.all('*', (req, res) => {
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({error: '404 Not Found'});
    } else {
        res.type('txt').send('404 Not Found');
    }
});

app.use(errorHandler)


app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));