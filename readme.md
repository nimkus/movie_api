# MyFlix DB

**MyFlix DB** is a movie API system that provides movie and user management, including features like authentication, data validation, and CRUD operations. The API is built with Node.js, Express, and MongoDB, offering a robust backend for managing movies, genres, directors, actors, and user data.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
- [Project Context](#project-context)
- [User Stories](#user-stories)
- [Feature Requirements](#feature-requirements)
- [Technical Requirements](#technical-requirements)

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
- **GET `/movies/genres/:genreName`**: Get details of a genre by name.
- **GET `/movies/directors/:directorName`**: Get details of a director by name.

### User Endpoints

- **POST `/users`**: Register a new user.
- **POST `/login`**: Login a user and get a JWT token.
- **GET `/users/:username`**: Get user profile by username.
- **PUT `/users/:username`**: Update user profile (username, email, password).
- **DELETE `/users/:username`**: Delete user profile.
- **PUT `/users/:username/:movieId`**: Add a movie to the user's favorite list.
- **DELETE `/users/:username/:movieId`**: Remove a movie from the user's favorite list.

## Project Context

This project is a backend for a movie management system called **MyFlix**. It enables users to browse and save their favorite movies, directors, and genres. The project aims to demonstrate mastery in backend development using JavaScript, Node.js, and MongoDB, while also offering user authentication and data validation.

### Objective
The goal is to build the server-side API for a movie web application that allows users to:
- View movie information, including details about genres and directors.
- Register, update, and manage their user profiles.
- Save and manage a list of favorite movies.

### MERN Stack
The project is part of the **MERN** stack (MongoDB, Express, React, Node.js), with this backend focusing on the first three components.

## User Stories

- As a user, I want to receive information on movies, directors, and genres so that I can learn more about the movies I’ve watched or am interested in.
- As a user, I want to create a profile so I can save data about my favorite movies.

## Feature Requirements

### Essential Features

- Return a list of all movies.
- Return details about a specific movie (e.g., title, genre, director, description).
- Return information about a genre and its description.
- Return information about a director.
- Allow users to register, update, and delete profiles.
- Allow users to manage their list of favorite movies.

### Optional Features

- Allow users to see which actors star in which movies.
- Allow users to view more detailed information about movies (e.g., release date, ratings).
- Allow users to create a "To Watch" list.

## Technical Requirements

- The API must be built using Node.js and Express.
- The API must use a RESTful architecture.
- The database must be a MongoDB database, modeled with Mongoose.
- The API must provide secure user authentication using JWT.
- Data validation must be implemented on user inputs.
- The project must be tested using tools like Postman.
- The code must be deployed to a public platform like GitHub and Heroku.

---

This project serves as a comprehensive showcase of full-stack JavaScript development, focusing on API creation, user authentication, data security, and MongoDB database operations.

For more details, visit the [API documentation](https://nimkus-movies-flix-6973780b155e.herokuapp.com/documentation.html).
