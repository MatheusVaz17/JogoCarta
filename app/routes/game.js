const router = require('express').Router();
const jwt = require('jsonwebtoken');
require('dotenv').config()
var blacklist = [];

router.get('/game', verifyJWT, (req, res) => {
    console.log(req.userId + ' fez esta chamada!');
    res.json([{ id: 1, nome: 'mat' }]);
});

function verifyJWT(req, res, next){
    const token = req.headers['x-access-token'];
    const index = blacklist.findIndex(item => item === token);
    if(index !== -1) return res.status(401).end();
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if(err) return res.status(401).end();
  
      req.userId = decoded.userId;
      next();
    })
}

module.exports = router;