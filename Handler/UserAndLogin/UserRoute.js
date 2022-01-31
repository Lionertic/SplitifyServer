var express = require('express');
const { body, validationResult } = require('express-validator');
var router = express.Router();
var {createOrUpdateUser, getUserByLogin, verifyPassword, getUsersForQuery} = require("./UserHandler")

router.post("/add_user",

  body('name').notEmpty().bail().isString(),
  body('password').notEmpty().bail().isString(),
  body('login').notEmpty().bail().isString().bail().custom(value => {
    return getUserByLogin(value).then( user =>{
      if(user) {
          return Promise.reject('Login already in use')
      };
    })
  }),

  async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      res.send( await createOrUpdateUser(req.body, req.url.includes("add")) );
    } catch (error) {
      res.status(500).send(error);
    }
});

router.post('/login', 

  body('password').notEmpty().bail().isString().withMessage("Enter Password"),
  body('login').notEmpty().bail().isString().bail().custom((value, {req, loc, path}) => {
      return getUserByLogin(value).then(async (user) => {
          if(!user) {
              return Promise.reject('LoginID not found')
          }
          let isPassswordValid = await verifyPassword(req.body.password, user.passwordHash)
          if(!isPassswordValid) {
            return Promise.reject("Password doesn't match")
          }
      })
  }),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let user = await createOrUpdateUser(req.body, true)
    res.json({token: user.token});
    
});

router.post("/edit",
  body('token').notEmpty().bail().isString().bail().custom((value,  {req, loc, path}) => {
    return getUsersForQuery({token:value}, true).then(user =>{
      if(!user || user.login != req.body.login) {
          return Promise.reject('Invalid token')
      };
    })
  }),

  async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      res.send( await createOrUpdateUser(req.body) );
    } catch (error) {
      res.status(500).send(error);
    }
});

module.exports = router;
