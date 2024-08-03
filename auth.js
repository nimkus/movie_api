const jwtSecret = 'your_jwt_secret';

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('.passport');

const generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.username,
    expiresIn: '7d', // 7 days
    algorithm: 'HS256', // algorithm to encode the values of the JWT
  });
};

// POST – login for users
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          return res.status(500).send(error);
        }
        const token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
