// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        gravity: {
            default: -320
        },
        playerControl: {
            default: null,
            type: cc.Node
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.director.getPhysicsManager().gravity = new cc.Vec2(0, this.gravity)

        let startLocation = null;
        let lastLocation = null;
        this.node.on(cc.Node.EventType.TOUCH_START, e => {
            startLocation = e.touch.getLocation();
            lastLocation = startLocation;
        });
        this.node.on(cc.Node.EventType.TOUCH_MOVE, e => {
            let currentLocation = e.touch.getLocation();
            if (startLocation !== null) {
                this.playerControl.getComponent('PlayerControl').applyForce(
                    new cc.Vec2(startLocation.x - currentLocation.x, startLocation.y - currentLocation.y));
            }
            lastLocation = currentLocation;
        });
        this.node.on(cc.Node.EventType.TOUCH_END, e => {
            if (startLocation !== null) {
                let currentLocation = e.touch.getLocation();
                this.playerControl.getComponent('PlayerControl').jump(
                    new cc.Vec2(startLocation.x - currentLocation.x, startLocation.y - currentLocation.y));
                startLocation = null;
                lastLocation = null;
            }
        });
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, e => {
            if (startLocation !== null && lastLocation != null) {
                this.playerControl.getComponent('PlayerControl').jump(
                    new cc.Vec2(startLocation.x - lastLocation.x, startLocation.y - lastLocation.y));
                startLocation = null;
                lastLocation = null;
            }
        });
    },

    start () {

    },

    // update (dt) {},
});
