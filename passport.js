const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  Models = require('./models.js'),
  passportJWT = require('passport-jwt');

let users = Models.users,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

// LocalStrategy
// db is checked for a user with username and password from request body

passport.use(
  new LocalStrategy(
    {
      usernameField: 'Username', // Map 'Username' field from the request body
      passwordField: 'Password', // Map 'Password' field from the request body
    },
    async (username, password, callback) => {
      try {
        // Log user login attempt, without exposing sensitive data
        console.log(`Login attempt for user: ${username}`);

        // Find user in the database by username
        const user = await users.findOne({ Username: username });

        if (!user) {
          // Log the issue without exposing sensitive data
          console.log('Login failed: Incorrect username');
          return callback(null, false, { message: 'Incorrect username or password.' });
        }

        // Ensure validatePassword is asynchronous if bcrypt is used
        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
          console.log('Login failed: Incorrect password');
          return callback(null, false, { message: 'Incorrect username or password.' });
        }

        // Log successful login
        console.log('Login successful');
        return callback(null, user); // Proceed with user authentication
      } catch (error) {
        console.error('Error during authentication:', error);
        return callback(error); // Pass the error to the callback for handling
      }
    }
  )
);

// JWT authentication
// authenticates users based on the JWT submitted alongside their request
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'your_jwt_secret',
    },
    async (jwtPayload, callback) => {
      try {
        const user = await users.findById(jwtPayload._id);
        if (user) {
          return callback(null, user);
        } else {
          return callback(null, fals, { message: 'User not found' });
        }
      } catch (err) {
        return callback(err);
      }
    }
  )
);
