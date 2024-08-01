const mongoose = require('mongoose');

// DEFINING DATA SCHEMAS

// Model for data about movies
let moviesSchema = mongoose.Schema({
  title: { type: String, required: true },
  year: { type: Number },
  genre: [{ type: mongoose.Schema.Types.ObjectId, ref: 'genres' }],
  director: [{ type: mongoose.Schema.Types.ObjectId, ref: 'directors' }],
  cast: [{ type: mongoose.Schema.Types.ObjectId, ref: 'cast' }],
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

// Model for data about the cast
let castSchema = mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String },
  dateOfbirth: Date,
  movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'movies' }],
});

// Model for data about Users
let usersSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'movies' }],
});

const movies = mongoose.model('movies', moviesSchema),
  genre = mongoose.model('genres', genreSchema),
  director = mongoose.model('directors', directorSchema),
  cast = mongoose.model('cast', castSchema),
  users = mongoose.model('users', usersSchema);

module.exports.movies = movies;
module.exports.genres = genre;
module.exports.directors = director;
module.exports.cast = cast;
module.exports.users = users;
