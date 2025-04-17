const express = require('express');
const router = express.Router();

router.get('/keepAlive', (req, res) => {
  res.json({msg: 'Coiseado o sistema RS'});
})

module.exports = router;