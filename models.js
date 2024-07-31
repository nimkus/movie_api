const mongoose = require('mongoose');

// DEFINING DATA SCHEMAS

// Model for data about movies
let moviesSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Year: { type: Number },
  Genre: [{ type: mongoose.Schema.Types.ObjectId, ref: 'genres' }],
  Director: [{ type: mongoose.Schema.Types.ObjectId, ref: 'directors' }],
  Cast: [{ type: mongoose.Schema.Types.ObjectId, ref: 'cast' }],
  Imdb_rating: { type: Number },
  Duration: { type: Number },
  Language: { type: String },
  Description: { type: String, required: true },
  ImagePath: { type: String },
  Featured: { type: Boolean },
});

// Model for Data about genres
let genresSchema = mongoose.Schema({
  Name: { type: String, required: true },
  Description: { type: String },
});

// Model for data about directors
let directorsSchema = mongoose.Schema({
  Name: { type: String, required: true },
  Bio: { type: String },
  Date_of_birth: Date,
  Date_of_death: Date,
});

// Model for data about the cast
let castSchema = mongoose.Schema({
  Name: { type: String, required: true },
  Bio: { type: String },
  DateOfBirth: Date,
  Movies: { type: String },
});

// Model for data about Users
let usersSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'movies' }],
});

let movies = mongoose.model('Movies', moviesSchema),
  genres = mongoose.model('Genres', genresSchema),
  directors = mongoose.model('Directors', directorsSchema),
  cast = mongoose.model('Cast', castSchema),
  users = mongoose.model('Users', usersSchema);

module.exports.movies = movies;
module.exports.genres = genres;
module.exports.directors = directors;
module.exports.cast = cast;
module.exports.users = users;
