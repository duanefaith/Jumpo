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
        focus: {
            default: null,
            type: cc.Node
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.focusPosition = null;
    },

    start () {
        
    },

    lateUpdate (dt) {
        if (!window.shared.gameStarted) {
            return;
        }
        if (!this.focusPosition) {
            this.focusPosition = this.focus.position;
        }
        let newFocusPosition = this.focus.position;
        let deltaY = newFocusPosition.y - this.focusPosition.y;
        if (deltaY !== 0) {
            this.node.position = new cc.Vec2(this.node.position.x, this.node.position.y + deltaY);
        }
        this.focusPosition = newFocusPosition;
    },
});
