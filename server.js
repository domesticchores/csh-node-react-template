// Pull in environment variables
require('dotenv').config();

// Configure the OpenID Connect strategy for use by Passport.
var passport = require('passport');
var Strategy = require('passport-openidconnect').Strategy;
passport.use(new Strategy({
  issuer: process.env.SSO_REDIRECT_URL,
  authorizationURL: process.env.SSO_REDIRECT_URL+'/protocol/openid-connect/auth',
  tokenURL: process.env.SSO_REDIRECT_URL+'/protocol/openid-connect/token',
  userInfoURL: process.env.SSO_REDIRECT_URL+'/protocol/openid-connect/userinfo',
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.HOST + '/login/callback'
},
  function(issuer, sub, profile, jwtClaims, accessToken, refreshToken, params, cb) {
    return cb(null, sub);
}));

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, {
      id: user.id,
      username: user.username,
      family_name: user.name.familyName,
      given_name: user.name.givenName
    });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

// Create a new Express application.
var express = require('express');
var app = express();

// Configure session handling
app.use(passport.authenticate('session'))

// Initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize());
app.use(passport.session());

// allow frontend to access for development
const cors = require('cors')
app.use(cors({origin: process.env.HOST}))

// Authentication: authenticates with CSH OIDC and returns to origin point
app.get('/login',
        passport.authenticate('openidconnect'));

app.get('/login/callback',
        passport.authenticate('openidconnect', { failureRedirect: '/login', keepSessionInfo: true}),
        (req, res) => {
          let returnURL = req.session.returnTo
          req.session.regenerate((err) => {
            if(err) return res.status(500).send("Auth session error"); // Failure
          });
          res.redirect(returnURL);
        }
      );

// Require auth for everything after default routes.
app.use(require('connect-ensure-login').ensureLoggedIn());

// Serve the frontend
app.use(express.static('frontend/dist'));

app.listen(parseInt(process.env.PORT));
