const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  uuid = require('uuid');

let movies = [
  {
    title: 'Movie1',
    description: 'Lorem Ipsum',
    genre: {
      name: 'GenreA',
      description: 'Lorem Ipsum',
    },
    director: {
      name: 'Director1',
      bio: 'Lorem Ipsum',
    },
  },
  {
    title: 'Movie2',
    description: 'Lorem Ipsum',
    genre: {
      name: 'GenreB',
      description: 'Lorem Ipsum',
    },
    director: {
      name: 'Director2',
      bio: 'Lorem Ipsum',
    },
  },
];

let users = [
  {
    id: 1,
    name: 'Jessica Drake',
    favMovies: [],
  },
  {
    id: 2,
    name: 'Ben Cohen',
    favMovies: ['Movie1'],
  },
  {
    id: 3,
    name: 'Lisa Downing',
    favMovies: [],
  },
];

// Calling Express
const app = express();

// create a write stream (in append mode) + a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' });

// setup the logger
//app.use(morgan('common')); // 'common' logs basic data such as IP address, the time of the request, the request method and path, as well as the status code that was sent back as a response
app.use(morgan('combined', { stream: accessLogStream }));

// setup static files
app.use('/', express.static('public'));

// Body parser and method override middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());

// ROUTES
app.get('/', (req, res) => {
  res.send('Welcome to our movie API!');
});

// ENDPOINTS: Movies

//READ
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

//READ
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find((movie) => movie.title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('No such movie exists');
  }
});

//READ
app.get('/movies/genres/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find((movie) => movie.genre.name === genreName).genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('No such genre exists');
  }
});

//READ
app.get('/movies/directors/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = movies.find((movie) => movie.director.name === directorName).director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('No such director exists');
  }
});

// ENDPOINTS: User

// CREATE
app.post('/users/', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send('Missing name in request body.');
  }
});

// CREATE
app.post('/users/:userId/:movieTitle', (req, res) => {
  const { userId, movieTitle } = req.params;

  let movie = movies.find((movie) => movie.title === movieTitle);
  let user = users.find((user) => user.id == userId);

  if (movie && user) {
    user.favMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to the array of user ${userId}`);
  } else {
    res.status(400).send('User or movie does not exist.');
  }
});

// READ
app.get('/users/:username', (req, res) => {
  res.status(200).json(
    users.find((user) => {
      return user.name === req.params.username;
    })
  );
});

// UPDATE
app.put('/users/:userId', (req, res) => {
  const { userId } = req.params;
  const updatedUser = req.body;

  let user = users.find((user) => user.id == userId);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('No such user.');
  }
});

// DELETE
app.delete('/users/:userId/:movieTitle', (req, res) => {
  const { userId, movieTitle } = req.params;

  let movie = movies.find((movie) => movie.title == movieTitle);
  let user = users.find((user) => user.id == userId);

  if (movie && user) {
    // Check if movieTitle is part of the user array
    const movExist = user.favMovies.filter((title) => title === movieTitle);
    if (movExist.length !== 0) {
      user.favMovies = user.favMovies.filter((title) => title !== movieTitle);
      res.status(200).send(`${movieTitle} has been removed from the array of user ${userId}`);
    } else {
      res.status(400).send(`${movieTitle} exists, but is not a favorite of user ${userId}`);
    }
  } else {
    res.status(400).send('User or movie does not exist.');
  }
});

// DELETE
app.delete('/users/:userId', (req, res) => {
  const { userId } = req.params;

  let user = users.find((user) => user.id == userId);

  if (user) {
    users = users.filter((user) => user.id != userId);
    res.status(200).send(`User ${userId} has been deleted.`);
  } else {
    res.status(400).send('No such user.');
  }
});

// catch-all error handling for application-level errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Port
app.listen(8080, () => {
  console.log('Your app ist listening on port 8080.');
});
