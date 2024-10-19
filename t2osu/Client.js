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
        
        this.banchoclient = new Banchojs.BanchoClient({ username: settings['osuUsername'].replace(" ", "_"), password: settings['password'] });
        this.tmiclient = new tmi.Client({
            channels: [ this.settings['twitchChannel'] ]
        });
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
    
                let formattedMessage = `${tags.username}: ${message}`;

                if(beatmapMatch?.length > 0) {
                    const bm = new Beatmap(beatmapMatch[0], beatmapMatch[1]);
        
                    var beatmapData = await bm.getBeatmapData();

                    if(beatmapData.type == 1) {
                        formattedMessage += ` - ${beatmapData.set.artist} - ${beatmapData.set.title} (${beatmapData.status}) | ${beatmapData.length} | BPM: ${beatmapData.bpm}`;
                    } else {
                        formattedMessage += ` - ${beatmapData.set.artist} - ${beatmapData.set.title} (${beatmapData.difficulty} ${beatmapData.difficulty_rating}*) (${beatmapData.status}) | ${beatmapData.length} | AR: ${beatmapData.ar} | BPM: ${beatmapData.bpm}`;
                    }
                }
                this.target.sendMessage(formattedMessage);
            }
        });
        return true;
    }

    async stop() {
        this.banchoclient.disconnect();
        this.tmiclient.disconnect();
    }
}