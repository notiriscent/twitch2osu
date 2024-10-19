const Express = require('express');
const fs = require('fs');
const colors = require('colors');
const app = Express();
const { open } = require('openurl');

if (!fs.existsSync('config.json')) {
    console.warn('[warn]'.yellow, 'First launch detected, writing default config.'.bold.white);
    const defaultConfig = {
        password: '',
        twitchChannel: '',
        osuUsername: '',
        autoStart: true,
        debug: false
    };

    fs.writeFileSync('config.json', JSON.stringify(defaultConfig, '\n', 2));
    console.info('[info]'.blue, 'Default config created, please press Enter and restart the program.'.bold.white);

    process.stdin.on('data', (key) => {
        process.exit(1);
    });
} else {
    main();
}

function main() {
    console.log('[info]'.blue, 't2osu! starting...'.white.bold)
    const config = require('./config.json');

    app.set('view engine', 'ejs');
    app.use(Express.static('public'))
    app.use('/', require('./routes/main'));
    app.use('/api', require('./routes/api'));
    
    try {
        app.listen(24727, async () => {
            console.log('[info]'.blue, `debug: ${config.debug}`.bold.yellow);
            console.log('[info]'.blue, 'Webserver listening on port 24727.'.bold.green);
            if(config.autoStart) {
                console.log('[info]'.blue, 'Starting message listener because of autoStart...'.bold.yellow);
                let res = await fetch('http://localhost:24727/api/server/start');
                if(res.ok) {
                    let data = await res.json();
                    console.log('[info]'.blue, `autoStart result: ${data.message}`.bold.green);
                } else {
                    console.error('[error]'.red, 'Failed to start message listener:', await res.text());
                }
            }
            if(config.debug) return;
            console.log('[info]'.blue, 'Opening localhost:24727 in your browser...'.bold.yellow);
            open('http://localhost:24727');
        });
    } catch (err) {
        console.error('[error]'.red, 'Failed to start webserver:', err.message);
        process.exit(1);
    }
}
