const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  mongoose = require('mongoose');

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

////////////////
// FUNCTIONS //
//////////////

// FUNCTIONS TO MANIPULATE STRINGS

// Function to capitalize the first letter of a string
function capitalize(string) {
  return string[0].toUpperCase() + string.slice(1);
}

// FUNCTIONS FOR ROUTING

// Function to get a list of all items from a db collection, with option to populate entries
function listAll(path, model, populateWith) {
  app.get(path, async (req, res) => {
    // path format: '/path'

    await model
      .find()
      .populate(populateWith)
      // format: 'fieldToPopulate1  fieldToPopulate2  fieldToPopulate3'
      .then((list) => {
        res.status(201).json(list);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });
}

// Function to get single of a db collection, with option to populate entries
function getSingleEntry(path, key, model, populateWith) {
  app.get(path, async (req, res) => {
    // path format: '/path/path/:entryName'

    // Extract the single value from req.params
    const paramValue = Object.values(req.params)[0];
    let name = capitalize(paramValue);

    await model
      .findOne({ [key]: name })
      .populate(populateWith)
      // format: 'fieldToPopulate1  fieldToPopulate2  fieldToPopulate3'
      .then((entry) => {
        if (entry) {
          res.status(201).json(entry);
        } else {
          res.status(400).send('"' + name + '" does not exist.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });
}

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

// ENDPOINTS MOVIES

// READ – Get a list
// of all movies
listAll('/movies', movies, 'genre director cast');
// of all genres
listAll('/movies/genres/all', genres);
// of all directors
listAll('/movies/directors/all', directors);
// of all actors
listAll('/movies/actors/all', cast);

// READ – Get a single entry
// specific movie, by title
getSingleEntry('/movies/:title', 'title', movies, 'genre director cast');
// specific genre, by name
getSingleEntry('/movies/genres/:genreName', 'name', genres);
// specific director, by name
getSingleEntry('/movies/directors/:directorName', 'name', directors);
// specific actor, by name
getSingleEntry('/movies/actors/:actorName', 'name', cast);

// ENDPOINTS USER

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

// READ – Get a list of all users
listAll('/users', users, 'FavoriteMovies');

// READ – Get a single entry, specific user by name
getSingleEntry('/users/:Username', 'Username', users, 'FavoriteMovies');

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
