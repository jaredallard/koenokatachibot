const express = require('express');
const oauth = require('oauth');
const expressSession = require('express-session')

const app = express()

const config = require('../config/config.json')
const twitterConsumerKey = config.twitter.consumer_key
const twitterConsumerSecret = config.twitter.consumer_secret

var consumer = new oauth.OAuth(
  "https://twitter.com/oauth/request_token", "https://twitter.com/oauth/access_token", 
  twitterConsumerKey, twitterConsumerSecret, "1.0A", "http://127.0.0.1:8080/sessions/callback", "HMAC-SHA1");

app.use(expressSession({ 
  secret: "very secret", 
  cookie: { maxAge: 60000 },
  resave: false,
  saveUninitialized: true
}));

app.use(function(req, res, next) {
  res.locals.session = req.session;
  return next();
});

app.get('/sessions/connect', (req, res) => {
  consumer.getOAuthRequestToken((error, oauthToken, oauthTokenSecret, results) => {
    if (error) return res.status(500).send("Error getting OAuth request token");

    req.session.oauthRequestToken = oauthToken;
    req.session.oauthRequestTokenSecret = oauthTokenSecret;
    res.redirect("https://twitter.com/oauth/authorize?oauth_token="+req.session.oauthRequestToken);
  });
});

app.get('/sessions/callback', (req, res) => {
  consumer.getOAuthAccessToken(req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier, (error, oauthAccessToken, oauthAccessTokenSecret, results) => {
    if (error) return res.status(500).send("Error getting OAuth access token");
    
    req.session.oauthAccessToken = oauthAccessToken;
    req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
    res.redirect('/home');
  });
});

app.get('/home', function(req, res){
    consumer.get("https://api.twitter.com/1.1/account/verify_credentials.json", req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, (error, data, response) => {
      if (error) return res.redirect('/sessions/connect');
      const parsedData = JSON.parse(data);

      console.log(`access_key: ${req.session.oauthAccessToken} access_key_secret: ${req.session.oauthAccessTokenSecret}`)

      // req.session.twitterScreenName = response.screen_name;    
      res.send('You are signed in: ' + parsedData.screen_name);
    });
});

app.get('*', (req, res) => {
    res.redirect('/home');
});

console.log('listening at 0.0.0.0:8080')
app.listen(8080);