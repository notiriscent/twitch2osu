const express = require('express');
const router = new express.Router();
const fs = require('fs');
const path = require('path');
const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'config.json')));

router.get('/', async (req, res) => {
    let client = await fetch('http://localhost:24727/api/server');
    let data = await client.json();
    res.render('main', { page: 'index', appConfig: config, clientState: data });
});

router.get('/config', async (req, res) => {
    let client = await fetch('http://localhost:24727/api/server');
    let data = await client.json();
    res.render('main', { page: 'config', appConfig: config, clientState: data });
});

router.get('/*', async (req, res, next) => {
    // check if req.path is a file, if it is, sendfile, if else, return
    let filePath = path.join(__dirname, '../public', req.path);
    if(fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        next();
    }
});

module.exports = router;