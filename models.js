const mongoose = require('mongoose');

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

const movies = mongoose.model('movies', moviesSchema),
  genres = mongoose.model('genres', genreSchema),
  directors = mongoose.model('directors', directorSchema),
  users = mongoose.model('users', usersSchema);

module.exports.movies = movies;
module.exports.genres = genres;
module.exports.directors = directors;
module.exports.users = users;
