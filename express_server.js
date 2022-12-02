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
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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
const fetchUserByEmail = (email, users) => {
  for (const id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  } return null;
};
//helper db loop requires:
// const email = req.body.email;
//   const user = fetchUserByEmail(email, users);
const fetchUrlsByUser = (user) => {
  let userUrls = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === user.id) {
      userUrls[key] = urlDatabase[key];
    }
  }
  return userUrls;
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
  if (fetchUserByEmail(email)) {
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
  const user = fetchUserByEmail(email, users);
  if (!email || !password) {
    return res.status(400).send('please provide an email AND a password');
  }
  if (!user) {
    return res.status(403).send('email is not yet registered');
  }
  if (password !== user.password) {
    return res.status(403).send('incorrect password');
  }
  res.cookie('user_id', user.id);
  res.redirect('/urls');
});


//logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});
// get urls
app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  if (!user) {
    return res.status(401).send('Please <a href= "/login"> login </a> to use this feature');
  }
  const templateVars = { urls: fetchUrlsByUser(user), user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});

//create a new url (post /urls)
app.post("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  if (!user) {
    return res.status(401).send('Please login to use this feature');
  }
  const newId = generateRandomString();
  urlDatabase[newId] = { longURL: `http://${req.body.longURL}`, userID: user.id };
  res.redirect(`/urls/${newId}`);
});

//url shortener index
app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404).send('invalid short id. link is not currently active');
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

//create new url
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_new", templateVars);
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


//delete url from database
app.post("/urls/:id/delete", (req, res) => {
  const user = users[req.cookies.user_id];
  const short = req.params.id;
  if (!user) {
    return res.status(401).send('Please login to use this feature');
  }
  if (!urlDatabase[short]) {
    return res.status(404).send('this short URL is not in the database');
  }
  if (!fetchUrlsByUser(user)[short]) {
    return res.status(401).send('You can only delete your own URLs');
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});
//post update url from database
app.post("/urls/:id/edit", (req, res) => {
  const user = users[req.cookies.user_id];
  const short = req.params.id;
  if (!user) {
    return res.status(401).send('Please login to use this feature');
  }
  if (!fetchUrlsByUser(user)[short]) {
    return res.status(401).send('You can only edit your own URLs');
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

//get page by id
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(400).send('This short URL is not active.');
  }
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});

//listen port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

