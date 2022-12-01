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




//url index
app.get("/urls", (req, res) => {
  console.log(req.cookies["username"]);
  const templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

//url shortener index
app.get("/u/:id", (req, res) => {
  const templateVars = { username: req.cookies["username"]};
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//create new url
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

//page by id
app.get("/urls/:id", (req, res) => {
  console.log("this string");
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"] };
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
  console.log(req.body.longURL); // Log the POST request body to the console
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

//login
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});
//logout
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

//listen port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);


});