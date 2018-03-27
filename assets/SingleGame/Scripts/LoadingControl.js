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
        statusLabel: {
            default: null,
            type: cc.Label
        },
        playersLabel: {
            default: null,
            type: cc.Label
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var intent = 'create';
        this.roomId = null;
        this.statusLabel.string = 'Loading';

        var self = this;

        SocketManager.getInstance().getEvents().on('room_connected', function () {
            console.log('room connected');
            self.enterRoom(self, intent);
        });
        SocketManager.getInstance().getEvents().on('room_resp', function (req, result) {
            console.log(result);
            if (req.type == 'room.create') {
                if (result.hasOwnProperty('error')) {
                    alert(JSON.stringify(result.error));
                    self.goBack();
                } else {
                    self.roomId = result.room.id;
                    self.refreshRoomUI(self, result.room);
                }
            }
        });
        SocketManager.getInstance().getEvents().on('room_push', function (data) {
            console.log(data);
            if (data.event == 'players_property_changed') {
                self.refreshRoomUI(self, data.room);
            }
        });
        // todo events

        console.log('socket state is ' + SocketManager.getInstance().getState());
        if (SocketManager.getInstance().getState() === 2) {
            if (!this.roomId) {
                this.enterRoom(this, intent);
                return;
            }
        } else if (SocketManager.getInstance().getState() === 0) {
            SocketManager.getInstance().connectRoom();
        }
        
    },

    enterRoom (self, intent) {
        if (intent == 'create') {
            let player = Global.getCurrentPlayer();
            if (player) {
                SocketManager.getInstance().sendToRoomSocket('room.create', {creator: player});
            }
        }
    },

    refreshRoomUI (self, roomData) {
        let players = roomData.players;
        let playersStr = '';
        Object.keys(players).forEach(function (key) {
            playersStr = playersStr + players[key].name + '\n';
        });
        self.playersLabel.string = playersStr;
    },

    gotoNextScene () {
        cc.director.loadScene('multi_player_game');
    },

    goBack() {
        cc.director.loadScene('welcome');
    },

    start () {
    },

    // update (dt) {},
});
