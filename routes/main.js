const express = require('express');
const router = new express.Router();
const Beatmap = require('../t2osu/Beatmap');
const config = require('../config.json');

router.get('/', async (req, res) => {
    let client = await fetch('http://localhost:24727/api/server');
    let data = await client.json();
    res.render('main', { page: 'index', appConfig: config, clientState: data });
});

module.exports = router;