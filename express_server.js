//requirements
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;


//set app view engine
app.set("view engine", "ejs");

//middleware
app.use(morgan('dev'));
app.use(cookieParser()); //req,res,next
app.use(express.urlencoded({ extended: true }));

//consts
const generateRandomString = function() {
  let randomChars = "";
  const alphaNum = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i <= 5; i++) {
    //62 characters in the alphanumeric possibilities including capitalized letters
    randomChars += alphaNum.charAt(Math.floor(Math.random() * 62));
  }
  return randomChars;
};
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};
//helper function loop
const existing = function(email) {
  let existingUser = null;
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      existingUser = user;
    }
  } return existingUser;
};

//register get
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render('register', templateVars);
});

//register post
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send('please provide email AND password');
  }
  if (existing(email)) {
    res.status(400).send('email is already registered');
  }
  const regId = generateRandomString();
  users[regId] = { id: regId, email, password };
  res.cookie("user_id", regId);
  res.redirect('/urls');
});

//login get
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render('login', templateVars);
});

//login post
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send('please provide an email AND a password');
  }
  if (!existing(email)) {
    return res.status(403).send('email is not yet registered');
  }
  if (password !== existing(email).password) {
    return res.status(403).send('incorrect password');
  }

  res.cookie('user_id', req.body.user_id);
  res.redirect('/urls');
});


//logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});

//url shortener index
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//create new url
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_new", templateVars);
});

//page by id
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//create a new url submission
app.post("/urls", (req, res) => {
  const newId = generateRandomString();
  urlDatabase[newId] = `http://${req.body.longURL}`;

  res.redirect(`/urls/${newId}`); // Respond with 'Ok' (we will replace this)
});

//delete url from database
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});
//update url from database
app.post("/urls/:id/edit", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});


//listen port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});