// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

const SocketManager = require('SocketManager');
const Global = require('Global');

cc.Class({
    extends: cc.Component,

    properties: {
         noticePrefab: {
            default: null,
            type: cc.Prefab
         },
         waitingPrefab: {
            default: null,
            type: cc.Prefab
         },
         defaultThumb: {
            default: null,
            type: cc.SpriteFrame
         }
    },

    onLoad () {
        this.noticeNode = null;
        this.waitingNode = null;
        this.replaceWithNoticePrefab();
        let self = this;
        SocketManager.getInstance().getEvents().on('room_push', function (data) {
            if (data.event == 'players_property_changed') {
                let players = data.room.players;
                let count = Object.keys(players).length;
                if (count > 1) {
                    self.replaceWithWaitingPrefab(players);
                } else {
                    self.replaceWithNoticePrefab();
                }
            }
        });
    },

    replaceWithNoticePrefab() {
        this.noticeNode = null;
        this.waitingNode = null;
        this.node.removeAllChildren();
        this.noticeNode = cc.instantiate(this.noticePrefab);
        this.node.addChild(this.noticeNode);
    },

    replaceWithWaitingPrefab(players) {
        this.noticeNode = null;
        this.waitingNode = null;
        this.node.removeAllChildren();
        this.waitingNode = cc.instantiate(this.waitingPrefab);
        this.node.addChild(this.waitingNode);

        let currentPlayer = Global.getCurrentPlayer();
        let battlePlayer = null;
        Object.keys(players).forEach( (playerId) => {
            if (playerId !== currentPlayer.id) {
                battlePlayer = players[playerId];
            }
        });

        let rightPlayerThumb = this.waitingNode.getChildByName('right_player_border').children[0].children[0];
        console.log(rightPlayerThumb);
        console.log(battlePlayer);
        let loadDefault = () => {
            rightPlayerThumb.spriteFrame = this.defaultThumb;
        };
        if (battlePlayer.photo) {
            cc.loader.load(battlePlayer.photo, function (err, texture) {
                if (err) {
                    console.log(err);
                    loadDefault();
                    return;
                }
                if (texture) {
                    rightPlayerThumb.spriteFrame = new cc.SpriteFrame(texture);
                }
            });
        } else {
            loadDefault();
        }
    },
});
