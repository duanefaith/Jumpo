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
        ignoredColliderGroups: {
            default: [],
            type: [cc.String]
        },
        boxShownBone: {
            default: null,
            type: dragonBones.ArmatureDisplay
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.boxShownBone.playAnimation('animation', 1);
        this.isPointInArea = function (point, position, size) {
            if (point && position && size) {
                if (point.x < (position.x - size.width / 2) || point.x > (position.x + size.width / 2)) {
                    return false;
                }
                if (point.y < (position.y - size.height / 2) || point.y > (position.y + size.height / 2)) {
                    return false;
                }
            }
            return true;
        };
    },

    onBeginContact (contact, selfCollider, otherCollider) {
        let ignored = false;
        let groupName = otherCollider.node.group;
        for (let ignoredColliderGroup of this.ignoredColliderGroups) {
            if (ignoredColliderGroup === groupName) {
                ignored = true;
                break;
            }
        }
        if (ignored) {
            let shouldDisable = true;
            if (otherCollider.node.hasOwnProperty('collideSetting')) {
                let collideSetting = otherCollider.node.collideSetting;
                let once = collideSetting.once;
                let originalGroup = collideSetting.originalGroup;
                if (collideSetting.hasOwnProperty('target')) {
                    if (collideSetting.target !== this.node) {
                        shouldDisable = false;
                        console.log('target error');
                    }
                }
                if (shouldDisable
                     && collideSetting.hasOwnProperty('ignoreArea')
                     && collideSetting.hasOwnProperty('ignorePosition')) {
                    let points = contact.getWorldManifold().points;
                    if (points && points.length > 0) {
                        let inArea = true;
                        for (let point of points) {
                            if (!this.isPointInArea(this.node.convertToNodeSpaceAR(point),
                             collideSetting.ignorePosition, collideSetting.ignoreArea)) {
                                inArea = false;
                                break;
                            }
                        }
                        if (!inArea) {
                            shouldDisable = false;
                            console.log('area error');
                        }
                    }
                }
                if (once) {
                    if (originalGroup) {
                        otherCollider.node.group = originalGroup;
                        delete otherCollider.node.collideSetting;
                    }
                }
            }
            contact.disabled = shouldDisable;
        }
    },

    // update (dt) {},
});
