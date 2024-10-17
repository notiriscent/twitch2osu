const Banchojs = require("bancho.js");
const tmi = require('tmi.js');

function transformLength(length) {
    let minutes = Math.floor(length / 60);
    let seconds = length % 60;
    if(seconds < 10) {
        seconds = "0" + seconds;
    }
    return `${minutes}:${seconds}`;
}

console.info('\x1b[36m%s\x1b[0m',
`
(v1.2.0)
 _            _ _       _     ___                 
| |          (_) |     | |   |__ \\                
| |___      ___| |_ ___| |__    ) |___  ___ _   _ 
| __\\ \\ /\\ / / | __/ __| '_ \\  / // _ \\/ __| | | |
| |_ \\ V  V /| | || (__| | | |/ /| (_) \\__ \\ |_| |
 \\__| \\_/\\_/ |_|\\__\\___|_| |_|____\\___/|___/\\__,_|
`)

const { password, input } = require('@inquirer/prompts');

var settings = {
    password: undefined,
    twitchChannel: undefined,
    osuUsername: undefined
};

var client;

(async () => {
    settings['password'] = await password({ message: 'Enter your osu! IRC password:', mask: true });
    settings['twitchChannel'] = await input({ message: 'Enter your Twitch channel:' });
    settings['osuUsername'] = await input({ message: 'Enter your osu! username:' });
    client = new Banchojs.BanchoClient({ username: settings['osuUsername'].replace(" ", "_"), password: settings['password'] });
    const tmiclient = new tmi.Client({
        channels: [ settings['twitchChannel'] ]
    });
    
    var target;
    
    client.connect().then(() => {
        console.log('\x1b[36m%s\x1b[0m', "We're online!");
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
                    console.error(`Error fetching Catboy API data for beatmap ${beatmapId}: ${cbData.error}`);
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
})();