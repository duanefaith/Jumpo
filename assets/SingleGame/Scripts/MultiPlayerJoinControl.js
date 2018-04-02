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

cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad () {

    },

    setData (data) {
        this.data = data;
        let self = this;
        SocketManager.getInstance().getEvents().on('room_connected', function () {
            console.log('room connected');
            let player = Global.getCurrentPlayer();
            let reqData;
            if (player) {
                reqData = { roomId:data.roomId, player: player };
            } else if (data.player) {
                reqData = { roomId:data.roomId, player: data.player };
            }
            if (reqData) {
                 SocketManager.getInstance().sendToRoomSocket('room.join', reqData);
            }
        });
         SocketManager.getInstance().getEvents().on('room_resp', function (req, result) {
            console.log(result);
            if (req.type == 'room.join') {
                if (result.hasOwnProperty('error')) {
                    alert(JSON.stringify(result.error));
                } else {
                    self.refreshUI();
                }
            }
        });
        SocketManager.getInstance().connectRoom();
    },

    refreshUI () {

    },

});
