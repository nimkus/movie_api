const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  uuid = require('uuid'),
  mongoose = require('mongoose');

// Function to capitalize the first letter of a string
function capitalizeFLetter(string) {
  let capitalizedString = string[0].toUpperCase() + string.slice(1);
  return capitalizedString;
}

// Integrating Mongoose Models
const Models = require('./models.js');
const { get } = require('http');

const movies = Models.movies,
  genres = Models.genres,
  directors = Models.directors,
  cast = Models.cast,
  users = Models.users;

mongoose.connect('mongodb://localhost:27017/myFlixDB');

// Calling Express
const app = express();

//////////////
// LOGGING //
////////////

// create a write stream (in append mode) + a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' });

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

///////////////////
// JSON PARSING //
/////////////////

// Body parser and method override middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());

///////////////////
// STATIC FILES //
/////////////////

// setup static files
app.use('/', express.static('public'));

//////////////////
// APP ROUTING //
////////////////

// --> ENDPOINTS: Home

// READ
app.get('/', (req, res) => {
  res.send('Welcome to our movie API!');
});

// --> ENDPOINTS: Movies

// READ Get a list of all movies
app.get('/movies', async (req, res) => {
  await movies
    .find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ Get a single movie, by title
app.get('/movies/:title', async (req, res) => {
  await movies
    .findOne({ title: req.params.title })
    .populate('genre')
    .then((movie) => {
      if (movie) {
        res.status(200).json(movie);
      } else {
        let movieTitle = capitalizeFLetter(req.params.title);
        res.status(400).send('The movie "' + movieTitle + '" does not exist');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//READ
app.get('/movies/genres/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find((movie) => movie.genre.name === genreName);

  if (genre) {
    res.status(200).json(genre.genre);
  } else {
    res.status(400).send('No such genre exists');
  }
});

//READ
app.get('/movies/directors/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = movies.find((movie) => movie.director.name === directorName);

  if (director) {
    res.status(200).json(director.director);
  } else {
    res.status(400).send('No such director exists');
  }
});

// --> ENDPOINTS: User

// CREATE – Add a new user

/* Expected format
{
  Username: { type: string, required: true },
  Password: { type: string, required: true },
  Email: { type: string, required: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'movies' }],
}*/

app.post('/users', async (req, res) => {
  await users
    .findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
            FavoriteMovies: req.body.FavoriteMovies,
          })
          .then((user) => {
            res.status(201).json(user);
          })
          .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
          });
      }
    })
    .catch((err) => {
      console.error(error);
      res.status(500).send('Error: ' + err);
    });
});

// CREATE – Add a favorite movie to a user
app.post('/users/:username/:movieId', async (req, res) => {
  await users
    .findOneAndUpdate(
      { Username: req.params.username },
      {
        $push: { FavoriteMovies: req.params.movieId },
      },
      { new: true }
    )
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ – Show all users
app.get('/users', async (req, res) => {
  await users
    .find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ – Show data of a specific user
app.get('/users/:Username', async (req, res) => {
  await users
    .findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// UPDATE Change user info, by user name

/* We’ll expect JSON in this format
{
  Username: { type: string, required: true },
  Password: { type: string, required: true },
  Email: { type: string, required: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'movies' }],
}*/

app.put('/users/:Username', async (req, res) => {
  await users
    .findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true } // This line makes sure that the updated document is returned
    )
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// DELETE Movie title
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

// DELETE User
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
