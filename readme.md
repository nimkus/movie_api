# MyFlix DB

A movie API system providing movie and user management with features like authentication and data validation.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
- [Usage](#usage)
- [License](#license)

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
https://movie-api-4o5a.onrender.com/

## API Endpoints
Movies
- Get all movies: GET /movies
- Get a movie by title: GET /movies/:title
- Get movies by genre: GET /movies/genre/:name
- Get a director by name: GET /director/:name

Users
- Get all users: GET /users
- Create a user: POST /users
- Update a user: PUT /users/:username
- Delete a user: DELETE /users/:username
- Add movie to favorites: POST /users/:username/movies/:MovieID
- Remove movie from favorites: DELETE /users/:username/movies/:MovieID

## Usage
Explore the API at http://localhost:8080/docs once the server is running.

## License
MIT License - see the LICENSE file for details.