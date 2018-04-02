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
        players: {
            default: [],
            type: [cc.Node]
        },
        dismissDist: {
            default: new cc.Vec2(70, 70)
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.callback = null;
    },

    setCallback (callback) {
        this.callback = callback;
    },

    start () {
        this.isDismissing = false;
        this.findContactedPlayer = () => {
            for (let player of this.players) {
                if (Math.abs(player.position.x - this.node.position.x) <= this.dismissDist.x
                    && Math.abs(player.position.y- this.node.position.y) <= this.dismissDist.y) {
                    return player;
                }
            }
            return null;
        };
    },

    lateUpdate (dt) {
        let player = this.findContactedPlayer();
        if (player) {
            if (!this.isDismissing) {
                this.isDismissing = true;
                if (this.callback) {
                    this.callback(this.node, player);
                }
                var self = this;
                self.players = [];
                this.getComponent(cc.Animation).on('stop', function() {
                    self.node.removeFromParent();
                });
                this.getComponent(cc.AudioSource).play();
                this.getComponent(cc.Animation).play('star_dismiss');
            }
        }
    },
});
