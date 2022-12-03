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
module.exports = { fetchUrlsByUser, fetchUserByEmail };