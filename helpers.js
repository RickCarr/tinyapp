//helper function loop
const fetchUserByEmail = (email, users) => {
  for (const id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  } return null;
};
//helper db loop requires const 'user'
const fetchUrlsByUser = (user, urlDatabase) => {
  let userUrls = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === user.id) {
      userUrls[key] = urlDatabase[key];
    }
  }
  return userUrls;
};
//helper random string generator
const generateRandomString = function() {
  let randomChars = "";
  const alphaNum = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i <= 5; i++) {
    //62 characters in the alphanumeric possibilities including capitalized letters
    randomChars += alphaNum.charAt(Math.floor(Math.random() * 62));
  }
  return randomChars;
};
module.exports = { fetchUrlsByUser, fetchUserByEmail, generateRandomString };