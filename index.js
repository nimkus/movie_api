const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path');

const app = express();
// create a write stream (in append mode) + a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' });

// setup the logger
//app.use(morgan('common')); // 'common' logs basic data such as IP address, the time of the request, the request method and path, as well as the status code that was sent back as a response
app.use(morgan('combined', { stream: accessLogStream }));

// setup static files
app.use('/', express.static('public'));

// Responses
app.get('/', (req, res) => {
  res.send('Welcome to our movie API!');
});

app.get('/movies', (req, res) => {
  let movieJson = '{"top1":"Movie1", "top2":"Movie2", "top3":"Movie3"}';
  res.send(JSON.parse(movieJson));
});

// catch-all error handling for application-level errors
const bodyParser = require('body-parser'),
  methodOverride = require('method-override');

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(bodyParser.json());
app.use(methodOverride());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Port
app.listen(8080, () => {
  console.log('Your app ist listening on port 8080.');
});
