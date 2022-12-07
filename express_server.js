//requirements
const express = require('express');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { fetchUrlsByUser, fetchUserByEmail, generateRandomString } = require('./helpers');
const { urlDatabase, users } = require('./databases');


const app = express();
const PORT = 8080;


//set app view engine
app.set("view engine", "ejs");

//middleware
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'getYourOwnCookie',
  keys: ['s', 'e', 'c', 'r', 'e', 't'],
  maxAge: 24 * 60 * 60 * 1000
}));
app.use(express.urlencoded({ extended: true }));

//register get
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  (users[req.session.user_id]) ? res.redirect('/urls') : res.render('register', templateVars);
});

//register post
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send('please provide email AND password');
  }
  if (fetchUserByEmail(email, users)) {
    return res.status(400).send('email is already registered');
  }
  const regId = generateRandomString();
  users[regId] = { id: regId, email, password: bcrypt.hashSync(password, 10) };
  req.session.user_id = regId;
  res.redirect('/urls');
});

//login get
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  (users[req.session.user_id]) ? res.redirect('/urls') : res.render('login', templateVars);
});

//login post
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = fetchUserByEmail(email, users);
  if (!email || !password) {
    return res.status(400).send('please provide an email AND a password');
  }
  if (!user) {
    return res.status(403).send('email is not yet registered');
  }
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(403).send('incorrect password');
  }
  req.session.user_id = user.id;
  res.redirect('/urls');
});

//logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//short url link
app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send('invalid short id. link is not currently active');
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

// get urls
app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(401).send('Please <a href= "/login"> login </a> or <a href= "/register"> register </a> to use this feature');
  }
  const templateVars = { urls: fetchUrlsByUser(user, urlDatabase), user: users[req.session.user_id] };
  res.render("urls_index", templateVars);
});

//create a new url (post /urls)
app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(401).send('Please <a href= "/login"> login </a> or <a href= "/register"> register </a> to use this feature');
  }
  const newId = generateRandomString();
  urlDatabase[newId] = { longURL: req.body.longURL, userID: user.id };
  res.redirect(`/urls/${newId}`);
});

//create new url
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//delete url from database
app.post("/urls/:id/delete", (req, res) => {
  const user = users[req.session.user_id];
  const short = req.params.id;
  if (!user) {
    return res.status(401).send('Please <a href= "/login"> login </a> or <a href= "/register"> register </a> to use this feature');
  }
  if (!urlDatabase[short]) {
    return res.status(404).send('this short URL is not in the database');
  }
  if (!fetchUrlsByUser(user, urlDatabase)[short]) {
    return res.status(401).send('You can only delete your own URLs');
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});
//post update url from database
app.post("/urls/:id/edit", (req, res) => {
  const user = users[req.session.user_id];
  const short = req.params.id;
  if (!user) {
    return res.status(401).send('Please <a href= "/login"> login </a> or <a href= "/register"> register </a> to use this feature');
  }
  if (!fetchUrlsByUser(user, urlDatabase)[short]) {
    return res.status(401).send('You can only edit your own URLs');
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

//get page by id
app.get("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
  const short = req.params.id;
  if (!urlDatabase[req.params.id]) {
    return res.status(400).send('This short URL is not active.');
  }
  if (!user) {
    return res.status(401).send('Please <a href= "/login"> login </a> or <a href= "/register"> register </a> to use this feature');
  }
  if (!fetchUrlsByUser(user, urlDatabase)[short]) {
    return res.status(401).send('You can only view your own URLs');
  }
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.session.user_id] };
  res.render("urls_show", templateVars);
});

//listen port
app.listen(PORT, () => {
});

