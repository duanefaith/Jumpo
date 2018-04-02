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
        impulseRatio: {
            default: 20
        },
        maxImpluseX: {
            default: 5000
        },
        maxImpluseY: {
            default: 5000
        },
        maxLineLength: {
            default: 200
        },
        dashGap: {
            default: 15
        },
        minScaleRatio: {
            default: 0.5
        },
        playerPrefabs: {
            default: [],
            type: [cc.Prefab]
        },
        graphicsPannel: {
            default: null,
            type: cc.Graphics
        },
        tremblingVariance: {
            default: new cc.Vec2(0.05, 0.05)
        },
        tremblingFrames: {
            default: 10
        },
        grabDist: {
            default: new cc.size(20, 20)
        },
        hangingColliderTolerence: {
            default: 3,
        },
        hangingColliderCount: {
            default: 5,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.states = {
            STATE_STILL: 0,
            STATE_FALLING: 1,
            STATE_FORCING_LOW: 2,
            STATE_FORCING_HIGH: 3,
            STATE_JUMPING: 4,
            STATE_HANGING: 5,
            STATE_HANGING_FORCING: 6,
            STATE_STILL_1: 7,
            STATE_STILL_2: 8,
        };
        this.playerIcon = null;
        let selected = Math.floor(Math.random() * this.playerPrefabs.length);
        if (selected >= this.playerPrefabs.length) {
            selected = this.playerPrefabs.length - 1;
        }
        this.playerIcon = cc.instantiate(this.playerPrefabs[selected]);
        this.node.addChild(this.playerIcon, -1);

        this.events = new cc.EventTarget();
        this.body = this.getComponent(cc.RigidBody);
        this.playerDisplay = this.playerIcon.getComponent(dragonBones.ArmatureDisplay);
        this.boxManager = this.node.parent.getComponent("BoxManager");

        this.setState(this.states.STATE_STILL);

        this.refreshJumpStart();
        this.originalScaleY = this.node.scaleY;
        this.getActualVec = (vec) => {
            let actualVec = vec.mul(this.impulseRatio);
            if (Math.abs(actualVec.x) > Math.abs(this.maxImpluseX)) {
                actualVec = actualVec.mul(Math.abs(this.maxImpluseX / actualVec.x));
            }
            if (Math.abs(actualVec.y) > Math.abs(this.maxImpluseY)) {
                actualVec = actualVec.mul(Math.abs(this.maxImpluseY / actualVec.y));
            }
            return actualVec;
        };
        this.moveCursor = (start, length, vec) => {
            let deltaVec = vec.mul(length / Math.sqrt(vec.x * vec.x + vec.y * vec.y));
            let destVec = new cc.Vec2(start.x + deltaVec.x, start.y + deltaVec.y);
            this.graphicsPannel.moveTo(destVec.x, destVec.y);
            return destVec;
        };
        this.drawLine = (start, length, vec) => {
            this.graphicsPannel.moveTo(start.x, start.y);
            let deltaVec = vec.mul(length / Math.sqrt(vec.x * vec.x + vec.y * vec.y));
            let destVec = new cc.Vec2(start.x + deltaVec.x, start.y + deltaVec.y);
            this.graphicsPannel.lineTo(destVec.x, destVec.y);
            this.graphicsPannel.stroke();
            return destVec;
        };

        this.setBoxesAlpha = (alpha) => {
            this.boxManager.setBoxesAlpha(alpha);
        };

        this.findNearestBox = (y, lowestBox) => {
            return this.boxManager.findNearestBox(y, lowestBox);
        };

        this.calcPositionVariance = (positionList) => {
            let sumVec = new cc.Vec2(0, 0);
            for (let position of positionList) {
                sumVec.addSelf(position);
            }
            let avgVec = sumVec.div(positionList.length);
            let varianceVec = new cc.Vec2(0, 0);
            for (let position of positionList) {
                let subVec = position.sub(avgVec);
                varianceVec.addSelf(new cc.Vec2(subVec.x * subVec.x, subVec.y * subVec.y));
            }
            varianceVec.divSelf(positionList.length);
            return varianceVec;
        }

        this.gameFinishCallback = null;

        this.stillInterval = 0;
    },

    start () {
        this.positionList = [];

        this.connectedBox = null;
        this.connectedBoxLeft = false;

        this.events.on('property_changed', (event) => {
            let data = event.getUserData();
            if (data.property == 'state') {
                if (data.newValue == data.target.states.STATE_STILL) {
                    data.target.playerIcon.scaleX = Math.abs(data.target.playerIcon.scaleX);
                    data.target.playerDisplay.playAnimation('idle', 0);
                } else if (data.newValue == data.target.states.STATE_FALLING) {
                    data.target.playerDisplay.playAnimation('luoxia', 0);
                } else if (data.newValue == data.target.states.STATE_FORCING_LOW) {
                    // data.target.playerDisplay.playAnimation('xuli', 1);
                } else if (data.newValue == data.target.states.STATE_FORCING_HIGH) {
                    data.target.playerDisplay.playAnimation('D_xuli2', 1);
                } else if (data.newValue == data.target.states.STATE_JUMPING) {
                    if (data.extra.vec.x > 0) {
                        data.target.playerIcon.scaleX = - (Math.abs(data.target.playerIcon.scaleX));
                    }
                    data.target.playerDisplay.playAnimation('tiao', 1);
                } else if (data.newValue == data.target.states.STATE_HANGING) {
                    let connectedNode = data.target.boxManager.createConnectedNode(data.extra.box, data.extra.left);
                    let joint;
                    if (data.extra.left) {
                        data.target.playerIcon.scaleX = - Math.abs(data.target.playerIcon.scaleX);
                        joint = data.target.getComponents(cc.RevoluteJoint)[1];
                        joint.connectedBody  = connectedNode.getComponent(cc.RigidBody);
                        joint.connectedAnchor = new cc.Vec2( - (connectedNode.width / 2), connectedNode.height / 2);
                        joint.apply();
                    } else {
                        data.target.playerIcon.scaleX = Math.abs(data.target.playerIcon.scaleX);
                        joint = data.target.getComponents(cc.RevoluteJoint)[0];
                        joint.connectedBody  = connectedNode.getComponent(cc.RigidBody);
                        joint.connectedAnchor = new cc.Vec2(connectedNode.width / 2, connectedNode.height / 2);
                        joint.apply();
                    }
                    data.target.connectedBox = data.extra.box;
                    data.target.connectedBoxLeft = data.extra.left;
                    data.target.playerDisplay.addEventListener(dragonBones.EventObject.COMPLETE, function () {
                        data.target.playerDisplay.removeEventListener(dragonBones.EventObject.COMPLETE);
                        data.target.playerDisplay.playAnimation('xuangua_idle', 0);
                    });
                    data.target.playerDisplay.playAnimation('xuangua_huanchong', 1);
                } else if (data.newValue == data.target.states.STATE_HANGING_FORCING) {
                    // data.target.playerDisplay.playAnimation('xuangua2', 1);
                } else if (data.newValue == data.target.states.STATE_STILL_1) {
                    data.target.playerDisplay.playAnimation('idle2', 2);
                    data.target.getComponents(cc.AudioSource)[1].play();
                    data.target.playerDisplay.addEventListener(dragonBones.EventObject.COMPLETE, function () {
                        data.target.setState(data.target.states.STATE_STILL);
                        data.target.playerDisplay.removeEventListener(dragonBones.EventObject.COMPLETE);
                    });
                } else if (data.newValue == data.target.states.STATE_STILL_2) {
                    data.target.playerDisplay.playAnimation('idle3', 2);
                    data.target.getComponents(cc.AudioSource)[1].play();
                    data.target.playerDisplay.addEventListener(dragonBones.EventObject.COMPLETE, function () {
                        data.target.setState(data.target.states.STATE_STILL);
                        data.target.playerDisplay.removeEventListener(dragonBones.EventObject.COMPLETE);
                    });
                } 
            }
        });
    },

    setState (state, extra = null) {
        if (this.state != state) {
            let oldState = this.state;
            this.state = state;
            console.log('state changed from ' + oldState + ' to ' + state);
            this.events.emit('property_changed', {target: this, property: 'state', oldValue: oldState, newValue: this.state, extra: extra});
        }
    },

    applyForce (vec) {
        if (!this.isStill()) {
            return;
        }
        
        this.graphicsPannel.clear();

        let actualVec = this.getActualVec(vec).mul(this.maxLineLength / Math.sqrt(this.maxImpluseX * this.maxImpluseX + this.maxImpluseY * this.maxImpluseY));
        let finalDist = Math.sqrt(actualVec.x * actualVec.x + actualVec.y * actualVec.y);

        let dashCounts = Math.floor(finalDist / this.dashGap);
        let startVec = new cc.Vec2(this.graphicsPannel.node.width / 2, this.graphicsPannel.node.height / 2);
        for (let i = 0; i < dashCounts; i ++) {
            if (i % 2 == 0) {
                startVec = this.drawLine(startVec, this.dashGap, vec);
            } else {
                startVec = this.moveCursor(startVec, this.dashGap, vec);
            }
        }

        if (dashCounts % 2 == 0) {
            let remainLength = finalDist - dashCounts * this.dashGap;
            if (remainLength > 0) {
                this.drawLine(startVec, remainLength, vec);
            }
        }

        let rate = finalDist / this.maxLineLength;
        if (this.connectedBox != null) {
            let frame = Math.floor(25 * rate);
            this.playerDisplay.armature().animation.gotoAndStopByFrame('xuangua2', frame);
            this.setState(this.states.STATE_HANGING_FORCING, {vec: vec});
        } else {
            let baseRate = 0.4;
            if (rate >= baseRate) {
                this.setState(this.states.STATE_FORCING_HIGH, {vec: vec});
            } else {
                let frame = Math.floor(30 * rate / baseRate) + 1;
                this.playerDisplay.armature().animation.gotoAndStopByFrame('xuli', frame);
                this.setState(this.states.STATE_FORCING_LOW, {vec: vec});
            }
        }
    },

    registerGameFinishCallback (callback) {
        this.gameFinishCallback = callback;
    },

    jump (vec) {
        this.graphicsPannel.clear();
        if (!this.isStill()) {
            return;
        }
        if (this.connectedBox) {
            this.node.getComponents(cc.RevoluteJoint).forEach((joint) => {
                joint.connectedBody = null;
                joint.connectedAnchor = new cc.Vec2(0, 0);
                joint.apply();
            });
            this.boxManager.removeConnectedNode(this.connectedBox, this.connectedBoxLeft);
            let ignorePositionX;
            let tolerence = 3;
            if (this.connectedBoxLeft) {
                ignorePositionX = - this.connectedBox.width / 2;
            } else {
                ignorePositionX = this.connectedBox.width / 2;
            }
            this.node.collideSetting = {
                target: this.connectedBox,
                ignoreArea: new cc.size(this.hangingColliderTolerence
                    , this.connectedBox.height + this.hangingColliderTolerence),
                ignorePosition: new cc.Vec2(ignorePositionX, 0),
                collideCount: this.hangingColliderCount,
                originalGroup: this.node.group
            };
            this.node.group = 'hanging';
            this.connectedBox = null;
            this.connectedBoxLeft = false;
        }
        this.refreshJumpStart();
        this.body.applyLinearImpulse(this.getActualVec(vec), this.body.getWorldCenter(), true);
        this.setState(this.states.STATE_JUMPING, {vec: vec});
        this.getComponents(cc.AudioSource)[0].play();
    },

    lateUpdate (dt) {
        if (this.state == this.states.STATE_STILL) {
            this.stillInterval = this.stillInterval + dt;
            if (this.stillInterval > 5) {
                let rand = Math.random();
                if (rand <= (1 / 3)) {
                    // do nothing
                } else if (rand <= (2 / 3)) {
                    this.setState(this.states.STATE_STILL_1);
                } else {
                    this.setState(this.states.STATE_STILL_2);
                }
                this.stillInterval = 0;
            }
        } else {
            this.stillInterval = 0;
        }

        if (window.shared.gameStarted) {
            if (!this.originalPosition) {
                this.originalPosition = this.node.position;
            }
        }
        
        let currentPosition = this.node.position;
        if (this.positionList.length > this.tremblingFrames) {
            this.positionList.shift();
        }
        this.positionList.push(currentPosition);

        if (this.state == this.states.STATE_JUMPING) {
            let {box, dist} = this.findNearestBox(this.node.position.y, this.boxManager.getHighestReachedBox());
            if (box && Math.abs(dist) <= this.grabDist.height) {
                if (Math.abs(currentPosition.x + this.node.width / 2
                 - box.position.x + box.width / 2) <= this.grabDist.width) {
                    if (!this.boxManager.hasConnectedNode(box, true)) {
                        this.setState(this.states.STATE_HANGING, {box: box, left: true});
                    }
                    return;
                } else if (Math.abs(currentPosition.x - this.node.width / 2
                 - box.position.x - box.width / 2) <= this.grabDist.width) {
                    if (!this.boxManager.hasConnectedNode(box, false)) {
                        this.setState(this.states.STATE_HANGING, {box: box, left: false});
                    }
                    return;
                }
            }
        }

        let varianceVec = this.calcPositionVariance(this.positionList);
        if (varianceVec.x < this.tremblingVariance.x && varianceVec.y < this.tremblingVariance.y) {
            if (!this.isForcing() && !this.isStill()) {
                this.setState(this.states.STATE_STILL);
            }
        } else {
            if (this.isFalling()) {
                if (this.originalPosition && currentPosition.y - this.originalPosition.y <= 1) {
                    this.refreshJumpStart(false);
                    this.setState(this.states.STATE_STILL);
                    this.node.group = 'default';
                    this.setBoxesAlpha(255);

                    if (this.gameFinishCallback !== null) {
                        this.gameFinishCallback();
                    }
                }
            } else {
                if (currentPosition.y - this.jumpStart.y + this.node.height < 0) {
                    this.setState(this.states.STATE_FALLING);
                    this.node.group = 'falling';
                    delete this.node.collideSetting;
                    this.setBoxesAlpha(100);
                }
            }
        }
        
    },

    refreshJumpStart(useHighestBox = true) {
        let hightestBox = this.node.parent.getComponent('BoxManager').getHighestReachedBox();
        if (useHighestBox && hightestBox) {
            this.jumpStart = new cc.Vec2(this.node.position.x, hightestBox.position.y - hightestBox.height / 2);
        } else {
            this.jumpStart = new cc.Vec2(this.node.position.x, this.node.position.y - this.node.height / 2);
        }
    },

    getEvents() {
        return this.events;
    },

    isStill () {
        return this.state == this.states.STATE_STILL
         || this.state == this.states.STATE_STILL_1
         || this.state == this.states.STATE_STILL_2
         || this.state == this.states.STATE_HANGING
         || this.isForcing();
    },

    isFalling() {
        return this.state == this.states.STATE_FALLING;
    },

    isForcing() {
        return this.state == this.states.STATE_FORCING_LOW 
         || this.state == this.states.STATE_FORCING_HIGH
         || this.state == this.states.STATE_HANGING_FORCING;
    },
});
