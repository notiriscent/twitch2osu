const express = require('express');
const router = new express.Router();
const Beatmap = require('../t2osu/Beatmap');

router.get('/', async (req, res) => {
    res.render('main', { page: 'index' });
});

module.exports = router;