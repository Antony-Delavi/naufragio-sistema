const express = require('express');

router.get('/keepAlive', (req, res) => {
  res.json({msg: 'Coiseado o sistema RS'});
})