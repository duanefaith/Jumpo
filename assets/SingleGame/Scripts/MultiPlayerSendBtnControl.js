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
const SocketManager = require('SocketManager');
const States = require('StateConstants').SOCKET;

cc.Class({
    extends: cc.Component,

    properties: {
        button: {
            default: null,
            type: cc.Button
        }
    },

    onLoad () {
        var intent = 'create';

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
                } else {
                    self.button.interactable = true;
                    SocketManager.getInstance().saveToRoomExtra('room_id', result.room.id);
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
        let roomId = SocketManager.getInstance().getRoomExtra('room_id');
        if (roomId) {
            this.button.interactable = true;
        } else {
            this.button.interactable = false;
        }
        if (SocketManager.getInstance().getState() === States.ROOM_CONNECTED) {
            if (!roomId) {
                this.enterRoom(this, intent);
                return;
            }
        } else if (SocketManager.getInstance().getState() === States.NOT_CONNECTED) {
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

    onSendBtnClicked () {
         let roomId = SocketManager.getInstance().getRoomExtra('room_id');
         if (roomId) {
            Global.loadImage('res/raw-assets/SingleGame/Textures/box.png').then(function (data) {
                let player = Global.getCurrentPlayer();
                Global.shareContent(player.name + '邀请你参加一场战斗！', data, {
                    type: 'battle_request',
                    data: {
                        roomId: roomId
                    }
                });
            });
         } else {
            alert('创建房间失败！');
         }
    },
});
