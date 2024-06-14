const router = require('express').Router();
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config()
const colorsName = ['#faebd7', '#ff6638', '#82e5d8', '#c6d95b', '#e16262'];

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

router.post('/access', (req, res) => {
    if (!req.body.name) {
      res.redirect('/');
    }
    
    //ToDo jwt auth
    const token = jwt.sign({userId: 1}, process.env.JWT_SECRET, {expiresIn: 300});
    let color = colorsName[Math.floor(Math.random()*colorsName.length)];
    res.render('game', {name: req.body.name, color: color});
});

router.post('/logout', function (req, res){
    blacklist.push(req.headers['x-access-token']);
    res.end();
});

module.exports = router;