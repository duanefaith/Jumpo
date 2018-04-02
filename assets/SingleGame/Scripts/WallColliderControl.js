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
        offset:{
            default: new cc.Vec2(0, 0)
        },
        starBurstPrefab: {
            default: null,
            type: cc.Prefab
        }
    },

    onBeginContact (contact, selfCollider, otherCollider) {
        let points = contact.getWorldManifold().points;
        if (points && points.length > 0) {
            let point = points[0];
            let localPoint = this.node.convertToNodeSpaceAR(point);
            let starBurst = cc.instantiate(this.starBurstPrefab);
            this.node.addChild(starBurst, 50);
            starBurst.setPosition(localPoint.addSelf(this.offset));
            starBurst.getComponent(dragonBones.ArmatureDisplay).addEventListener(dragonBones.EventObject.COMPLETE, function () {
                starBurst.getComponent(dragonBones.ArmatureDisplay).removeEventListener(dragonBones.EventObject.COMPLETE);
                starBurst.removeFromParent();
            });
            starBurst.getComponent(dragonBones.ArmatureDisplay).playAnimation('animation', 1);
        }
    },
});
