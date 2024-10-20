const express = require('express');
const colors = require('colors');
const router = new express.Router();
const Client = require('../t2osu/Client');
const config = require('../config.json');

var client;
client = new Client(config);

router.get('/server/start', async (req, res) => {
    console.log('[info]'.blue, 'Message listener start attempted.'.green.bold);
    if(client.banchoclient.isConnected()) {
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

router.get('/server/stop', async (req, res) => {
    console.log('[info]'.blue, 'Message listener stop attempted.'.green.bold);
    if(!client.banchoclient.getConnectState() == 'Connected') {
        res.status(400).json({ message: 'Message listener is not running.' });
        return;
    }
    await client.stop();
    res.status(200).json({ message: 'Message listener stopped successfully.' });
});

router.get('/server', async (req, res) => {
    res.status(200).json({
        isConnected: client.banchoclient.isConnected(),
        connectState: client.banchoclient.getConnectState().description,
        target: client.target?.ircUsername || 'Not connected'
    });
});

router.get('/config', async (req, res) => {
    res.status(200).json(config);
});

module.exports = router;