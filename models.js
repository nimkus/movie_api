const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// DEFINING DATA SCHEMAS

// Model for data about movies
let moviesSchema = mongoose.Schema({
  title: { type: String, required: true },
  year: { type: Number },
  genre: [{ type: mongoose.Schema.Types.ObjectId, ref: 'genres' }],
  director: [{ type: mongoose.Schema.Types.ObjectId, ref: 'directors' }],
  imdb_rating: { type: Number },
  duration: { type: Number },
  language: { type: String },
  description: { type: String, required: true },
  imagePath: { type: String },
  featured: { type: Boolean },
});

// Model for Data about genres
let genreSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
});

// Model for data about directors
let directorSchema = mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String },
  date_of_birth: Date,
  date_of_death: Date,
});

// Model for data about the actors
let castSchema = mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String },
  dateOfbirth: Date,
  movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'movies' }],
});

// Model for data about Users
let usersSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  birthday: Date,
  favMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'movies' }],
});

// HASHING AND VALIDATING USER PASSWORD

// Configure different salt rounds based on the environment
const SALT_ROUNDS = process.env.NODE_ENV === 'production' ? 12 : 8; // Higher rounds for production, lower for development

// Asynchronous password hashing
usersSchema.statics.hashPassword = async function (password) {
  if (!password) {
    throw new Error('Password cannot be empty'); // Validate that the password is provided
  }

  try {
    // Generate a salt asynchronously, ensure SALT_ROUNDS is a number
    const salt = await bcrypt.genSalt(parseInt(SALT_ROUNDS));
    if (!salt) {
      throw new Error('Salt generation failed'); // Check if salt generation was successful
    }

    // Hash the password using the salt
    const hashedPassword = await bcrypt.hash(password, salt); // Hashing the password
    return hashedPassword;
  } catch (error) {
    throw new Error('Error hashing password: ' + error.message); // Improved error handling
  }
};

// Asynchronous password validation
usersSchema.methods.validatePassword = async function (password) {
  try {
    // Compare the provided password with the hashed one asynchronously
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    // Handle any errors during password comparison
    throw new Error('Error validating password: ' + error.message);
  }
};

// CREATING AND EXPORTING MONGOOSE MODELS
const movies = mongoose.model('movies', moviesSchema),
  genres = mongoose.model('genres', genreSchema),
  directors = mongoose.model('directors', directorSchema),
  actors = mongoose.model('cast', castSchema),
  users = mongoose.model('users', usersSchema);

module.exports.movies = movies;
module.exports.genres = genres;
module.exports.directors = directors;
module.exports.actors = actors;
module.exports.users = users;
