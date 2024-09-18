/**
 * App Setup
 */

const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  mongoose = require('mongoose'),
  Models = require('./models.js'),
  { get } = require('http'),
  bcrypt = require('bcrypt'),
  { check, validationResult } = require('express-validator');

// Integrating Mongoose models
const { movies, genres, directors, actors, users } = Models;

// Connect to MongoDB
async function connectToDatabase() {
  // Connect locally in development, to MongoDBAtlas in production
  const dbURI =
    process.env.NODE_ENV === 'production' ? process.env.CONNECTION_URI : 'mongodb://localhost:27017/myFlixDB';

  try {
    await mongoose.connect(dbURI); // No need for deprecated options
    console.log('Successfully connected to the database!');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
  }
}

// Connect to MongoDB
connectToDatabase();

// Calling Express
const app = express();

/**
 * Functions for routing
 */

// List all items of a db collection
function listAll(routePath, model, populateWith) {
  app.get(routePath, passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
      const list = await model.find().populate(populateWith);
      res.status(201).json(list);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  });
}

// List a single item of a db collection
function getSingleEntry(routePath, key, model, populateWith) {
  app.get(routePath, passport.authenticate('jwt', { session: false }), async (req, res) => {
    const name = Object.values(req.params)[0];

    try {
      const entry = await model.findOne({ [key]: name }).populate(populateWith);
      if (entry) {
        res.status(201).json(entry);
      } else {
        res.status(400).send(`"${name}" does not exist.`);
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  });
}

/**
 * Logging
 */

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' });

// set up the logger
app.use(morgan('combined', { stream: accessLogStream }));

/**
 * JSON Parsing
 */

// Body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// method override middleware
app.use(methodOverride());

/**
 * Stactic Files
 */

app.use('/', express.static('public'));

/**
 * App Routing
 */

// Using CORS (Cross-origin resource sharing)
const cors = require('cors');

// Load allowed origins
const allowedOrigins = ['http://localhost:8080', 'http://localhost:1234'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Check if app is in production mode
      const isProduction = process.env.NODE_ENV === 'production';
      if (!origin) {
        // Allow all requests without origin in development, block in production
        return callback(
          isProduction ? new Error('CORS policy doesn’t allow access from unspecified origins') : null,
          !isProduction
        );
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true); // Allow listed origins
      }

      // Log and block non-allowed origins
      console.log(`CORS policy blocked request from origin: ${origin}`);
      const message = isProduction
        ? 'CORS policy blocked this request'
        : `The CORS policy doesn’t allow access from origin ${origin}`;

      return callback(new Error(message), false);
    },
    optionsSuccessStatus: 200, // Some browsers may return status 204 by default
  })
);

/**
 * Endpoint LOGIN
 */

// Login for users, generating a JWT
let auth = require('./auth')(app);

// Logic for authenticating users
const passport = require('passport');
require('./passport');

/**
 * Endpoint HOME
 */

// READ – Homepage
app.get('/', (req, res) => {
  res.send('Welcome to our movie API!');
});

/**
 * Endpoints MOVIES
 */

// READ – Get a list
// of all movies
listAll('/movies', movies, 'genre director');
// of all genres
listAll('/movies/genres/all', genres);
// of all directors
listAll('/movies/directors/all', directors);
// of all actors
listAll('/movies/actors/all', actors, 'movies');

// READ – Get a single entry
// specific movie, by title
getSingleEntry('/movies/:title', 'title', movies, 'genre director');
// specific genre, by name
getSingleEntry('/movies/genres/:genreName', 'name', genres);
// specific director, by name
getSingleEntry('/movies/directors/:directorName', 'name', directors);
// specific actor, by name
getSingleEntry('/movies/actors/:actorName', 'name', actors, 'movies');

/**
 * Endpoints USERS
 */

// CREATE – Add a new user
/**
 * expected format:
 * username: { type: String, required: true },
 * password: { type: String, required: true },
 * email: { type: String, required: true },
 * birthday: Date,
 * favMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'movies' }],
 */
app.post(
  '/users',
  [
    check('username', 'Username must have at least 5 characters.').isLength({ min: 5 }),
    check('username', 'Username contains non-alphanumeric characters. Not allowed.').isAlphanumeric(),
    check(
      'password',
      'Password must include one lowercase character, one uppercase character, a number, and a special character.'
    ).isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      returnScore: false,
      pointsPerUnique: 1,
      pointsPerRepeat: 0.5,
      pointsForContainingLower: 10,
      pointsForContainingUpper: 10,
      pointsForContainingNumber: 10,
      pointsForContainingSymbol: 10,
    }),
    check('email', 'Email does not appear to be valid').isEmail(),
  ],
  async (req, res) => {
    // check validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = await users.hashPassword(req.body.password);

    try {
      // check if username already exists
      const existingUser = await users.findOne({ username: req.body.username });
      if (existingUser) {
        return res.status(400).send(`${req.body.username} already exists`);
      }

      const newUser = await users.create({
        username: req.body.username,
        password: hashedPassword,
        email: req.body.email,
        birthday: req.body.birthday,
        favMovies: req.body.favMovies,
      });
      res.status(201).send(`User "${newUser.username}" has been created.`);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  }
);

// CREATE – Add a favorite movie to a user, by ID
app.put('/users/:username/:movieId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const updatedUser = await users
      .findOneAndUpdate(
        { username: req.params.username },
        { $addToSet: { favMovies: req.params.movieId } },
        { new: true }
      )
      .populate('favMovies');
    res.status(201).send(`User has been updated.`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

// READ – Get a list of all users
listAll('/users', users, 'favMovies');

// READ – Get a single entry, specific user by name
getSingleEntry('/users/:username', 'username', users, 'favMovies');

// UPDATE Change user info, by user name
app.put('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  // users can only edit their own user info
  if (req.user.username !== req.params.username) {
    return res.status(400).send('Permission denied');
  }
  try {
    // Prepare the update object
    const updateFields = {
      username: req.body.username,
      email: req.body.email,
      birthday: req.body.birthday,
    };

    // Hash the password if provided
    if (req.body.password) {
      updateFields.password = await users.hashPassword(req.body.password);
    }

    // Update the user and populate the favorite movies
    const updatedUser = await users
      .findOneAndUpdate({ username: req.params.username }, { $set: updateFields }, { new: true })
      .populate('favMovies');

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

// DELETE – Remove user, by username
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await users.findOneAndDelete({ username: req.params.username });
    if (!user) {
      res.status(400).send(`${req.params.username} was not found`);
    } else {
      res.status(200).send(`${req.params.username} was deleted.`);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

// DELETE – Remove a favorite movie from a user, by ID
app.delete('/users/:username/:movieId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const updatedUser = await users
      .findOneAndUpdate({ username: req.params.username }, { $pull: { favMovies: req.params.movieId } }, { new: true })
      .populate('favMovies');
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

// catch-all error handling for application-level errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Port
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
