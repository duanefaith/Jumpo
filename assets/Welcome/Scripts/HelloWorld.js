let Global = require('Global');

cc.Class({
    extends: cc.Component,

    properties: {
        label: {
            default: null,
            type: cc.Label
        },
    },

    // use this for initialization
    onLoad: function () {
        Global.getCurrentPlayerScore().then((score) => {
            console.log(score);
        });
        Global.getPlayerScores().then((scores) => {
            console.log(scores);
        });
    },

    // called every frame
    update: function (dt) {

    },
});
