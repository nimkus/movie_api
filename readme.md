# MyFlix DB

**MyFlix DB** is a movie API system that provides movie and user management, including features like authentication, data validation, and CRUD operations. The API is built with Node.js, Express, and MongoDB, offering a robust backend for managing movies, genres, directors, actors, and user data.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
- [User Stories](#user-stories)

## Features

- **Movies API**: Access movie details such as title, description, genre, director, and actors.
- **User Management**: Register, update, and delete user profiles.
- **Authentication**: JWT-based authentication for secure API access.
- **Favorites**: Users can add or remove movies to/from their list of favorite movies.
- **Data Validation**: Ensures that all user input (e.g., username, password, email) meets required criteria.
- **Pagination**: Get movie lists with pagination support for large datasets.

## Technologies

- **Express.js**: Node.js web framework for building the API.
- **MongoDB**: NoSQL database used to store movie data and user information.
- **Mongoose**: MongoDB ODM to model the data and perform database operations.
- **Passport.js**: Authentication middleware for user login.
- **Swagger**: API documentation tool for easy reference and exploration.
- **CORS**: Middleware for handling Cross-Origin Resource Sharing.
- **Bcrypt.js**: Used for hashing passwords securely.
- **JWT (JSON Web Tokens)**: Used for user authentication and generating secure tokens.
- **Morgan**: HTTP request logger for better debugging.

## Setup

To run this project locally, follow the steps below:

### Prerequisites
- Node.js and npm
- MongoDB (or a MongoDB Atlas account for remote database access)

### Steps to Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/myflix-db.git
   ```
   Install the dependencies:

2. Install the dependencies:
   ```bash
   cd myflix-db
   npm install
   ```
   
3. Set up the environment variables in a .env file:
   ```bash
   CONNECTION_URI=your_mongodb_connection_uri
   JWT_SECRET=your_jwt_secret
   ```

4. Run the server:
   ```bash
   npm start
   ```

5. The API will be running on http://localhost:8080.

## API Documentation

You can explore the API documentation hosted at [MyFlix API Docs](https://nimkus-movies-flix-6973780b155e.herokuapp.com/documentation.html).

## API Endpoints

Below are the key API endpoints available:

### Movies Endpoints

- **GET `/movies`**: Get a list of all movies (paginated).
- **GET `/movies/:title`**: Get details of a single movie by title.
- **GET `/movies/genres/all`**: Get a list of all genres.
- **GET `/movies/genres/:genreName`**: Get details of a genre by name.
- **GET `/movies/directors/all`**: Get a list of all directors.
- **GET `/movies/directors/:directorName`**: Get details of a director by name.

### User Endpoints

- **POST `/users`**: Register a new user.
- **POST `/login`**: Login a user and get a JWT token.
- **GET `/users/:username`**: Get user profile by username.
- **PUT `/users/:username`**: Update user profile (username, email, password).
- **DELETE `/users/:username`**: Delete user profile.
- **PUT `/users/:username/:movieId`**: Add a movie to the user's favorite list.
- **DELETE `/users/:username/:movieId`**: Remove a movie from the user's favorite list.

## User Stories

- As a user, I want to receive information on movies, directors, and genres so that I can learn more about the movies I’ve watched or am interested in.
- As a user, I want to create a profile so I can save data about my favorite movies.

---

For more details, visit the [API documentation](https://nimkus-movies-flix-6973780b155e.herokuapp.com/documentation.html).
