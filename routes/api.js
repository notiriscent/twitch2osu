const express = require('express');
const colors = require('colors');
const router = new express.Router();
const Client = require('../t2osu/Client');
const config = require('../config.json');

var client;
client = new Client(config);

router.get('/server/start', async (req, res) => {
    console.log('[info]'.blue, 'Message listener start attempted.'.green.bold);
    if(client.active) {
        res.status(400).json({ message: 'Message listener is already running' });
        return;
    }

    try {
        await client.start();
        res.status(200).json({ message: 'Message listener start attempted. \nCheck /api/server for status' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to start server.', error: 'Internal error' });
    }
});

router.get('/server', async (req, res) => {
    if(client) {
        res.status(200).json({ status: client.banchoclient.isConnected() });
    } else {
        res.status(404).json({ message: 'No server instance found' });
    }
});

module.exports = router;