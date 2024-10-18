const express = require('express');
const router = new express.Router();
const Banchojs = require('bancho.js');
const tmi = require('tmi.js');

var tmiclient;
var client;

async function start(settings) {
    if(!settings) {
        return false;
    }
    client = new Banchojs.BanchoClient({ username: settings['osuUsername'].replace(" ", "_"), password: settings['password'] });
    tmiclient = new tmi.Client({
        channels: [ settings['twitchChannel'] ]
    });

    var target;

    client.connect().then(() => {
        target = client.getUser(settings['osuUsername'].replace(" ", "_"));
    }).catch(console.error);

    tmiclient.connect();

    tmiclient.on('message', async (channel, tags, message, self) => {
        if (!message.startsWith("!") || !message.startsWith("/")) {
            const beatmapRegex = /https:\/\/osu\.ppy\.sh\/b(?:eatmapsets)?\/(\d+)(?:#osu\/(\d+))?/gmi;
            let beatmapMatch;
            var beatmapData;
            while ((beatmapMatch = beatmapRegex.exec(message))!== null) {
                const beatmapId = Number(beatmapMatch[1]);
                const beatmapdiffId = Number(beatmapMatch[2]);

                const url = beatmapdiffId ? 'https://catboy.best/api/v2/b/' + beatmapdiffId : 'https://catboy.best/api/v2/s/' + beatmapId ;

                let cbApi = await fetch(url);

                let cbData = await cbApi.json();
                
                if (cbData.error) {
                    
                    return;
                }

                beatmapData = {
                    beatmaps: cbData.beatmaps,
                    difficulty: cbData?.difficulty_rating,
                    status: cbData?.status,
                    length: transformLength(cbData?.total_length || cbData?.beatmaps[0]?.total_length),
                    ar: cbData?.ar,
                    bpm: cbData?.bpm,
                    difficulty_name: cbData?.version,
                    title: cbData?.set?.title || cbData?.title,
                    artist: cbData?.set?.artist || cbData?.artist,
                }
            }

            let formattedMessage = `${tags.username}: ${message}`;
            if (beatmapData) {
                if(beatmapData.beatmaps) {
                    formattedMessage += ` - ${beatmapData.artist} - ${beatmapData.title} (${beatmapData.status}) | ${beatmapData.length} | BPM: ${beatmapData.bpm}`;
                } else {
                    formattedMessage += ` - ${beatmapData.artist} - ${beatmapData.title} (${beatmapData.difficulty_name} ${beatmapData.difficulty}*) (${beatmapData.status}) | ${beatmapData.length} | AR: ${beatmapData.ar} | BPM: ${beatmapData.bpm}`;
                }
            }
            target.sendMessage(formattedMessage);
        }
    });
    return true;
}

router.get('/server-start', async (req, res) => {
    try {
        let status = await start();
        if(status) {
            res.status(200).json({ message: 'Server started successfully' });
        } else {
            res.status(500).json({ message: 'Failed to start server' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Failed to start server' });
    }
});

module.exports = router;