const express = require('express');
const router = new express.Router();

router.get('/', (req, res) => {
    res.render('main', { page: 'index' });
});

module.exports = router;