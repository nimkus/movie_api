# MyFlix DB

A movie API system providing movie and user management with features like authentication and data validation.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)

## Features

- **Movies API**: Access movie details.
- **User Management**: Manage users and their favorite movies.
- **Authentication**: JWT-based security.
- **Swagger Documentation**: Interactive API docs.
- **Data Validation**: Ensures data integrity.

## Technologies

- **Express.js**: Node.js web framework.
- **MongoDB**: NoSQL database.
- **Mongoose**: MongoDB ODM.
- **Passport.js**: Authentication middleware.
- **Swagger**: API documentation tool.
- **Cors**: Cross-Origin Resource Sharing middleware.
- **Bcrypt**: Password hashing.

## View Live

https://nimkus-movies-flix-6973780b155e.herokuapp.com/

## API Endpoints

Movies

- Get all movies: GET /movies
- Get a movie by title: GET /movies/:title
- Get all genres: GET movies/genres/all
- Get movies by genre: GET /movies/genres/:name
- Get all directors: GET movies/directors/all
- Get a director by name: GET movies/directors/:name
- Get all actors: GET movies/actors/all
- Get a actor by name: GET movies/actors/:name

Users

- Get all users: GET /users
- Create a user: POST /users
- Update a user: PUT /users/:username
- Delete a user: DELETE /users/:username
- Add movie to favorites: PUT /users/:username/movies/:movieId
- Remove movie from favorites: DELETE /users/:username/movies/:movieId
