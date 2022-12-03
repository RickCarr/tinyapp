const { assert } = require('chai');

const { fetchUserByEmail, fetchUrlsByUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};
describe('fetchUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = fetchUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
  });

  it('should return undefined with an invalid email', function() {
    const user = fetchUserByEmail("wrong@example.com", testUsers);
    const expectedUserID = "undefined";
  });
});


const testUrlDatabase = {
  b6UTxQ: {
    longURL: "https://www.testing1.com",
    userID: "b6UTxQ",
  },
  bFDkiU: {
    longURL: "https://www.testing2.com",
    userID: "b6UTxQ",
  },
};


describe('fetchUrlsByUser', function() {
  it('should return urls created by user', function() {
    const urls = fetchUrlsByUser(testUrlDatabase.b6UTxQ, testUrlDatabase);
    const expectedUrls = "{https://www.testing1.com, https://testing2.com}";
  });
  it('should return null if no urls were created by user', function() {
    const urls = fetchUrlsByUser(testUsers.userRandomID, testUrlDatabase);
    const expectedUrls = null;
  });

});