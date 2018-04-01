// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

const Global = require('Global');

cc.Class({
    extends: cc.Component,

    onLoad () {
    	this.score = 0;
    },

    setScore (score) {
    	this.score = score;
    },

    onRestartBtnClicked () {
        this.node.parent.getComponent('ResultPannelControl').closeSelf({intent: 'restart'});
    },

    onShareBtnClicked () {
    	let player = Global.getCurrentPlayer();
        Global.shareContent(player.name + '在Jumpo中拿到了' + this.score + '分哦，快来挑战我吧！', './res/raw-assets/SingleGame/Textures/share.png', {
            type: 'result_share',
            player: player.id
        });
    },
});
