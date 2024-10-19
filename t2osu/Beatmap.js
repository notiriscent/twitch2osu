module.exports = class Beatmap {
    constructor(beatmapId, beatmapDiffId) {
        this._apiEndpoint = 'https://catboy.best/api/v2';

        this.beatmapId = beatmapId;
        this.beatmapDiffId = beatmapDiffId;

        this.set = {};

        this.set.beatmaps = null;

        this.status = null;
        this.length = null;
        this.ar = null;
        this.bpm = null;

        this.type = 0;

        if(this.beatmapDiffId) {
            this.type = 0;
            this.mapUrl = this._apiEndpoint + '/b/' + this.beatmapDiffId;
        } else {
            this.type = 1;
            this.mapUrl = this._apiEndpoint + '/s/' + this.beatmapId;
        }
    }

    async getBeatmapData() {
        let res = await fetch(this.mapUrl)
        let data = await res.json();

        if(this.type == 0) {
            this.length = data.total_length;
            this.difficulty_rating = data.difficulty_rating;
            this.difficulty = data.version;
            this.ar = data.ar;
            this.bpm = data.bpm;
            this.set.beatmaps = data.beatmaps;
            this.set.title = data.set.title;
            this.set.artist = data.set.artist;
        } else {
            let diffsBySR = {};

            for (let i in data.beatmaps) {
                diffsBySR[i] = data.beatmaps[i].difficulty_rating;
            }

            let topDiff = data.beatmaps.reduce((a, b) => a.difficulty_rating > b.difficulty_rating? a : b);

            this.length = topDiff.total_length;
            this.difficulty_rating = topDiff.difficulty_rating;
            this.difficulty = topDiff.version;
            this.ar = topDiff.ar;
            this.bpm = topDiff.bpm;
            this.set.beatmaps = data.beatmaps;
            this.set.title = data.title;
            this.set.artist = data.artist;
        }
        this.status = data.status;

        return this;
    }
}