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
        starBurstPrefab: {
            default: null,
            type: cc.Prefab
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
                let reset = () => {
                    if (originalGroup) {
                        otherCollider.node.group = originalGroup;
                        delete otherCollider.node.collideSetting;
                    }
                };
                if (collideSetting.hasOwnProperty('collideCount')) {
                    let collideCount = collideSetting.collideCount;
                    if (collideCount <= 0) {
                        reset();
                    } else {
                        collideSetting.collideCount = collideCount - 1;
                        otherCollider.node.collideSetting = collideSetting;
                    }
                }
            }
            contact.disabled = shouldDisable;
        }

        if (!contact.disabled) {
            let colliderInBottom = true;
            let points = contact.getWorldManifold().points;
            let bottomMid = new cc.Vec2(0, - this.node.height / 2);
            let bottomArea = new cc.size(this.node.width + 3, 3);
            if (points.length > 0) {
                for (let point of points) {
                    if (!this.isPointInArea(this.node.convertToNodeSpaceAR(point)
                        , bottomMid, bottomArea)) {
                        colliderInBottom = false;
                        break;
                    }
                }
                if (colliderInBottom) {
                    let localPoint = this.node.convertToNodeSpaceAR(points[0]);
                    let starBurst = cc.instantiate(this.starBurstPrefab);
                    this.node.addChild(starBurst, 50);
                    starBurst.setPosition(localPoint);
                    starBurst.getComponent(dragonBones.ArmatureDisplay).addEventListener(dragonBones.EventObject.COMPLETE, function () {
                        starBurst.getComponent(dragonBones.ArmatureDisplay).removeEventListener(dragonBones.EventObject.COMPLETE);
                        starBurst.removeFromParent();
                    });
                    starBurst.getComponent(dragonBones.ArmatureDisplay).playAnimation('animation', 1);
                }
            }
        }
    },
});
