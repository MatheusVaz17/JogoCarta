const router = require('express').Router();
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config()
const colorsName = ['#4287f5', '#f22e2e', '#3ceb10', '#e0eb10', '#542020'];
var name = '';
var color = '';

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

router.post('/access', (req, res) => {
    if (!req.body.name) {
      res.redirect('/');
    }
    
    //ToDo jwt auth
    const token = jwt.sign({userId: 1}, process.env.JWT_SECRET, {expiresIn: 300});
    //name = req.body.name;
    //color = colorsName[Math.floor(Math.random()*colorsName.length)];
    //res.sendFile(path.join(__dirname, '../public/game.html'));
    //return res.json({auth: true, token});
    res.render('game', {name: req.body.name, color: colorsName[Math.floor(Math.random()*colorsName.length)]});
});

router.post('/logout', function (req, res){
    blacklist.push(req.headers['x-access-token']);
    res.end();
});

module.exports = router;