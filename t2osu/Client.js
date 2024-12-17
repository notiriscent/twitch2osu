const Banchojs = require('bancho.js');
const tmi = require('tmi.js');
const Beatmap = require('./Beatmap');

module.exports = class Client {
    constructor(settings) {
        // NOTE: Required settings:
        /*
          osuUsername: osu! username of redirect target
          twitchChannel: Twitch channel to redirect messages from
          password: osu! irc password (needed to be able to send messages)
        */
        this.settings = settings;
        this.banchoclient = null;
        this.tmiclient = null;
        this.target = null;
        
        try {
            this.banchoclient = new Banchojs.BanchoClient({ username: settings['osuUsername'].replace(" ", "_"), password: settings['password'] });
        } catch(e) {
            console.error('[error]'.red, 'Failed to connect to osu! Bancho:', e.message, "\nSuggestion: check the config for typos".gray);
            
            process.stdin.on('data', (key) => {
                process.exit(1);
            });
        }
            this.tmiclient = new tmi.Client({
            channels: [ this.settings['twitchChannel'] ]
        });
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secondsRemaining = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secondsRemaining.toString().padStart(2, '0')}`;
    }

    async start() {
        await this.banchoclient.connect();
        this.target = this.banchoclient.getUser(this.settings['osuUsername'].replace(" ", "_"));
    
        this.tmiclient.connect();
        
        this.tmiclient.on('message', async (channel, tags, message, self) => {
            if(!this.banchoclient.isConnected()) return;
            if (!message.startsWith("!") || !message.startsWith("/")) {
                const beatmapRegex = /https:\/\/osu\.ppy\.sh\/b(?:eatmapsets)?\/(\d+)(?:#osu\/(\d+))?/gmi;
                let beatmapMatch = beatmapRegex.exec(message);

                let formattedMessage;

                if(beatmapMatch?.length > 0) {
                    const bm = new Beatmap(beatmapMatch[0], beatmapMatch[1]);
        
                    var beatmapData = await bm.getBeatmapData();
    
                    message = message.replace(beatmapMatch[0], `[${beatmapMatch[0]} ${beatmapData.set.artist} - ${beatmapData.set.title}] `);

                    this.target.sendMessage(`${tags.username}: ` + message);

                    formattedMessage = `${beatmapData.set.artist} - ${beatmapData.set.title}`;

                    if(beatmapData.type == 1) {
                        formattedMessage += ` - (${beatmapData.status}) | ${this.formatTime(beatmapData.length)} | BPM: ${beatmapData.bpm}`;
                    } else {
                        formattedMessage += ` - (${beatmapData.difficulty} - ${beatmapData.difficulty_rating}*) (${beatmapData.status}) | ${this.formatTime(beatmapData.length)} | AR: ${beatmapData.ar} | BPM: ${beatmapData.bpm}`;
                    }
                    formattedMessage += ` | 100% = ${beatmapData.ppforSS.pp.toFixed(1)}pp`;
                    this.target.sendMessage(formattedMessage);
                } else {
                    this.target.sendMessage(`${tags.username}: ${message}`);
                }
            }
        });
        return true;
    }

    async stop() {
        this.banchoclient.disconnect();
        this.tmiclient.disconnect();
    }
}