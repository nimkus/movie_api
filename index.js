const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  mongoose = require('mongoose');

// Function to capitalize the first letter of a string
function capitalize(string) {
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
    .populate('genre director cast')
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
    .populate('genre director cast')
    .then((movie) => {
      if (movie) {
        res.status(200).json(movie);
      } else {
        let movieTitle = capitalize(req.params.title);
        res.status(400).send('The movie "' + movieTitle + '" does not exist.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ Get a list of all genres
app.get('/movies/genres/all', async (req, res) => {
  await genres
    .find()
    .then((genres) => {
      res.status(201).json(genres);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//READ Get info on a specific genre, by name
app.get('/movies/genres/:genreName', async (req, res) => {
  await genres
    .findOne({ name: req.params.genreName })
    .then((genre) => {
      if (genre) {
        res.status(201).json(genre);
      } else {
        let genreName = capitalize(req.params.genreName);
        res.status(400).send('The genre "' + genreName + '" does not exist.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ Get a list of all actors
app.get('/movies/actors/all', async (req, res) => {
  await cast
    .find()
    .then((actors) => {
      res.status(201).json(actors);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ Get info on a specific actor, by name
app.get('/movies/actors/:actorName', async (req, res) => {
  await cast
    .findOne({ name: req.params.actorName })
    .then((actor) => {
      if (actor) {
        res.status(201).json(actor);
      } else {
        let actorName = capitalize(req.params.actorName);
        res.status(400).send('The actor "' + actorName + '" does not exist.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ Get a list of all directors
app.get('/movies/directors/all', async (req, res) => {
  await directors
    .find()
    .then((directors) => {
      res.status(201).json(directors);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ Get info on a specific director, by name
app.get('/movies/directors/:directorName', async (req, res) => {
  await directors
    .findOne({ name: req.params.directorName })
    .then((director) => {
      if (director) {
        res.status(201).json(director);
      } else {
        let directorName = capitalize(req.params.directorName);
        res.status(400).send('The actor "' + directorName + '" does not exist.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// --> ENDPOINTS: User

// CREATE – Add a new user
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
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// CREATE – Add a favorite movie to a user, by ID
app.post('/users/:username/:movieId', async (req, res) => {
  await users
    .findOneAndUpdate(
      { Username: req.params.username },
      {
        $push: { FavoriteMovies: req.params.movieId },
      },
      { new: true }
    )
    .populate('FavoriteMovies')
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ Get a list of all users
app.get('/users', async (req, res) => {
  await users
    .find()
    .populate('FavoriteMovies')
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ Show data of a specific user
app.get('/users/:Username', async (req, res) => {
  await users
    .findOne({ Username: req.params.Username })
    .populate('FavoriteMovies')
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// UPDATE Change user info, by user name
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
    .populate('FavoriteMovies')
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// DELETE Remove a favorite movie from a user, by ID
app.delete('/users/:Username/:movieId', async (req, res) => {
  await users
    .findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { FavoriteMovies: req.params.movieId },
      },
      { new: true }
    )
    .populate('FavoriteMovies')
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// DELETE remove user, by username
app.delete('/users/:Username', async (req, res) => {
  await users
    .findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
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
