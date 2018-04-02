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

    properties: {
        canvasNode: {
            default: null,
            type: cc.Node
        },
        btnGroup: {
            default: null,
            type: cc.Node
        },
    },

    onStartGameBtnClicked () {
        this.btnGroup.getComponent('BtnGroupControl').hideBtnGroup();
    },
    
    onLeaderBoardBtnClicked () {
        cc.director.loadScene('rank_scene');
    },

    onShareBtnClicked () {
        let player = Global.getCurrentPlayer();
        Global.shareContent(player.name + '也在玩Jumpo哦！', './res/raw-assets/SingleGame/Textures/share.jpg', {
            type: 'invite',
            player: player.id
        });
    },

    onMultiPlayerBtnClicked () {
        this.canvasNode.getComponent('MultiPlayerHelper').showInviteDialog();
    },

});
