const models = require('../models');

const Account = models.Account;

const loginPage = (req, res) => {
  res.render('login', { csrfToken: req.csrfToken() });
};

const allDecksPage = (req, res) => {
  res.render('app', { csrfToken: req.csrfToken() });
};


const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

const login = (request, response) => {
  const req = request;
  const res = response;

    // cast to strings
  const username = `${req.body.username}`;
  const password = `${req.body.pass}`;

  if (!username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return res.status(400).json({ error: 'Wrong username or password' });
    }

    req.session.account = Account.AccountModel.toAPI(account);

    return res.json({ redirect: '/' });
  });
};

const getToken = (request, response) => {
  const req = request;
  const res = response;
    
    //tell the client if they are logged in
    let loggedIn=false;
    if (req.session.account){
        loggedIn = true;
    }

  const csrfJSON = {
    csrfToken: req.csrfToken(),
      loggedIn: loggedIn,
  };

  res.json(csrfJSON);
};

const signup = (request, response) => {
  const req = request;
  const res = response;

    // cast to strings
  req.body.username = `${req.body.username}`;
  req.body.pass = `${req.body.pass}`;
  req.body.pass2 = `${req.body.pass2}`;

  if (!req.body.username || !req.body.pass || !req.body.pass2) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (req.body.pass !== req.body.pass2) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  return Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
    const accountData = {
      username: req.body.username,
      salt,
      password: hash,
    };

    const newAccount = new Account.AccountModel(accountData);

    const savePromise = newAccount.save();

    savePromise.then(() => {
      req.session.account = Account.AccountModel.toAPI(newAccount);
      return res.json({ redirect: '/' });
    });

    savePromise.catch((err) => {
      console.log(err);

      if (err.code === 11000) {
        return res.status(400).json({ error: 'Username already in use' });
      }

      return res.status(400).json({ error: 'An error occured' });
    });
  });
};

//send ads to the user on connection
const getAds = (request, response) => {
    const req = request;
  const res = response;
    
  const ads = {};

  // determine ad 1
  let randNum = Math.floor(Math.random() * 5) + 1; // 1 to 5
  ads.ad1 = `ad${randNum}.png`;

  // determine ad 2
  randNum = Math.floor(Math.random() * 5) + 6; // 6 to 10
  ads.ad2 = `ad${randNum}.png`;
    
    return res.json(ads);
}

module.exports.loginPage = loginPage;
module.exports.allDecksPage = allDecksPage;
module.exports.login = login;
module.exports.logout = logout;
module.exports.signup = signup;
module.exports.getToken = getToken;
module.exports.getAds = getAds;