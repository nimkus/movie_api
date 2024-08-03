const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  Models = require('./models.js'),
  passportJWT = require('passport-jwt');

let users = Models.users,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

// LocalStrategy
// username and password from request body --> check db thorugh Mongoose for a user with the same username
passport.use(
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'Password',
    },
    async (username, password, callback) => {
      console.log(`${username} ${password}`);
      try {
        const user = await users.findOne({ username: username });
        if (!user) {
          console.log('Incorrect username');
          return callback(null, false, {
            message: 'Incorrect username or password.',
          });
        }
        console.log('Authentication successful.');
        return callback(null, user);
      } catch (err) {
        console.error('Error during authentication:', err);
        return callback(err);
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
