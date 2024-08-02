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
listAll('/movies', movies, 'genre director');
// of all genres
listAll('/movies/genres/all', genres);
// of all directors
listAll('/movies/directors/all', directors);

// READ – Get a single entry
// specific movie, by title
getSingleEntry('/movies/:title', 'title', movies, 'genre director');
// specific genre, by name
getSingleEntry('/movies/genres/:genreName', 'name', genres);
// specific director, by name
getSingleEntry('/movies/directors/:directorName', 'name', directors);

// ENDPOINTS USER

// CREATE – Add a new user
app.post('/users', async (req, res) => {
  await users
    .findOne({ username: req.body.username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.username + 'already exists');
      } else {
        users
          .create({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            birthday: req.body.birthday,
            favMovies: req.body.favMovies,
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
      { username: req.params.username },
      {
        $addToSet: { favMovies: req.params.movieId },
      },
      { new: true }
    )
    .populate('favMovies')
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ – Get a list of all users
listAll('/users', users, 'favMovies');

// READ – Get a single entry, specific user by name
getSingleEntry('/users/:username', 'username', users, 'favMovies');

// UPDATE Change user info, by user name
app.put('/users/:username', async (req, res) => {
  await users
    .findOneAndUpdate(
      { username: req.params.username },
      {
        $set: {
          username: req.body.username,
          password: req.body.password,
          email: req.body.email,
          birthday: req.body.birthday,
        },
      },
      { new: true } // This line makes sure that the updated document is returned
    )
    .populate('favMovies')
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// DELETE Remove a favorite movie from a user, by ID
app.delete('/users/:username/:movieId', async (req, res) => {
  await users
    .findOneAndUpdate(
      { username: req.params.username },
      {
        $pull: { favMovies: req.params.movieId },
      },
      { new: true }
    )
    .populate('favMovies')
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// DELETE remove user, by username
app.delete('/users/:username', async (req, res) => {
  await users
    .findOneAndDelete({ username: req.params.username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.username + ' was not found');
      } else {
        res.status(200).send(req.params.username + ' was deleted.');
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
