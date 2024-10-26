const express = require('express');
const colors = require('colors');
const router = new express.Router();
const Client = require('../t2osu/Client');
const config = require('../config.json');
const fs = require('fs');
var bodyParser = require('body-parser');
router.use(bodyParser.json());

var client;

router.get('/server/start', async (req, res) => {
    if (!client) {
        client = new Client(config);
        console.log('[info]'.blue, 'Client instance created.'.green.bold);
    }
    console.log('[info]'.blue, 'Message listener start attempted.'.green.bold);
    if(client?.banchoclient?.isConnected()) {
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
    if (!client) {
        res.status(200).json({
            isConnected: false,
            connectState: 'Disconnected',
            target: 'Not connected'
        });
        return;
    }
    res.status(200).json({
        isConnected: client.banchoclient.isConnected(),
        connectState: client.banchoclient.getConnectState().description,
        target: client.target?.ircUsername || 'Not connected'
    });
});

router.get('/config', async (req, res) => {
    res.status(200).json(config);
});

router.post('/config/update', async (req, res) => {
    let newConfig = req.body;
    console.log('[info]'.blue, 'Received new config:'.green.bold, JSON.stringify(newConfig));
    fs.writeFileSync('config.json', JSON.stringify(newConfig, '\n', 2));
    await client?.stop();
    console.log('[info]'.blue, 'Config updated, server stopped. Restarting...');
    res.status(200);
    process.exit(0);
});

module.exports = router;