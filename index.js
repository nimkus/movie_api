////////////////
// APP SETUP //
//////////////

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
const { movies, genres, directors, users } = Models;

// Connect to database
mongoose.connect('process.env.CONNECTION_URI'); // Heroku
//mongoose.connect('mongodb://localhost:27017/myFlixDB');  // local

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

// Function to get single of a db collection, with option to populate entries
function getSingleEntry(routePath, key, model, populateWith) {
  app.get(routePath, passport.authenticate('jwt', { session: false }), async (req, res) => {
    const paramValue = Object.values(req.params)[0];
    const name = capitalize(paramValue);

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

app.use('/', express.static('public'));

//////////////////
// APP ROUTING //
////////////////

// Using CORS (Cross-origin resource sharing)
const cors = require('cors');

// Load allowed origins from environment variables, allowing flexibility across environments.
let allowedOrigins = ['http://localhost:8080', 'https://localhost:8080'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
        //If no origin is provided (e.g., server-to-server communication), deny by default
        //return callback(new Error('CORS policy doesn’t allow access from unspecified origins'), false);
      }

      // Check if the origin is in the allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true); // Allow request if origin is allowed
      } else {
        // Logging for better debugging and tracking
        console.log(`CORS policy blocked request from origin: ${origin}`);
        // Custom error message but avoid exposing the exact origin in production for security
        const message =
          process.env.NODE_ENV === 'production'
            ? 'CORS policy blocked this request'
            : `The CORS policy for this application doesn’t allow access from origin ${origin}`;

        return callback(new Error(message), false);
      }
    },
    optionsSuccessStatus: 200, // Some browsers (IE11, older versions of Chrome) may return status 204 by default
  })
);

//  ------ ENDPOINT LOGIN ------

// Login for users, generating a JWT as users log in
let auth = require('./auth')(app);
console.log(auth);

// Logic for authenticating users
const passport = require('passport');
require('./passport');
console.log(passport);

//  ------ ENDPOINT HOME ------

// READ – Get a welcome message, homepage
app.get('/', (req, res) => {
  res.send('Welcome to our movie API!');
});

// ------ ENDPOINTS MOVIES ------

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

// ------ ENDPOINTS USER ------

// CREATE – Add a new user
/* expected format:
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  birthday: Date,
  favMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'movies' }], */

app.post(
  '/users',
  [
    check('username', 'Username must have at least 5 characters.').isLength({ min: 5 }),
    check('username', 'Username contains non-alphanumeric characters. Not Allowed.').isAlphanumeric(),
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
    // Hash password input
    let hashedPassword = await users.hashPassword(req.body.password);

    try {
      // check if a user with the requested username already exists
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
      res.status(201).json(newUser);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  }
);

// CREATE – Add a favorite movie to a user, by ID
app.post('/users/:username/:movieId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const updatedUser = await users
      .findOneAndUpdate(
        { username: req.params.username },
        { $addToSet: { favMovies: req.params.movieId } },
        { new: true }
      )
      .populate('favMovies');
    res.json(updatedUser);
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
    const updatedUser = await users
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
        { new: true }
      )
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
