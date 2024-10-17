const { exec } = require('child_process');
let esbuild = require('esbuild');
const fs = require('fs');

const build = esbuild.buildSync({entryPoints: ['index.js'], bundle: true, platform: 'node', outfile: 'build/build.js'});

console.log('Building sea-config...');
exec('node --experimental-sea-config sea-config.json', (err, stdo, stde) => {
    if(err) {
        throw err;
    }

    console.log('Sea-config built successfully');

    fs.copyFileSync(process.execPath, './build/twitch2osu.exe');

    fs.copyFileSync('./sea-prep.blob', './build/file.blob');
    fs.unlinkSync('./sea-prep.blob');

    console.log('Postjecting into twitch2osu.exe...');
    exec('cd build && npx postject twitch2osu.exe NODE_SEA_BLOB file.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2', (err, stdo, stde) => {
        if(stdo) console.log(stdo);
        if(stde) console.error(stde);

        if(err) {
            throw err;
        }
    });
});