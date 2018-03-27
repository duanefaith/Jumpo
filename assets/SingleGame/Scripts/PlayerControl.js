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
        playerIcon: {
            default: null,
            type: cc.Node
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
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.states = {
            STATE_STILL: 0,
            STATE_FALLING: 1,
            STATE_FORCING_LOW: 2,
            STATE_FORCING_HIGH: 3,
            STATE_JUMPING: 4,
        };
        this.events = new cc.EventTarget();
        this.body = this.getComponent(cc.RigidBody);
        this.playerDisplay = this.playerIcon.getComponent(dragonBones.ArmatureDisplay);

        this.setState(this.states.STATE_STILL);

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

        this.originalPosition = this.node.position;
        this.jumpStart = this.originalPosition;

        this.setBoxesAlpha = (alpha) => {
            let boxManager = this.node.parent.getComponent("BoxManager");
            boxManager.setBoxesAlpha(alpha);
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
    },

    start () {
        this.positionList = [];

        this.events.on('property_changed', (event) => {
            let data = event.getUserData();
            if (data.property == 'state') {
                if (data.newValue == data.target.states.STATE_STILL) {
                    data.target.playerIcon.scaleX = Math.abs(data.target.playerIcon.scaleX);
                    data.target.playerDisplay.playAnimation('idle', 0);
                } else if (data.newValue == data.target.states.STATE_FALLING) {
                    data.target.playerDisplay.playAnimation('luoxia', 0);
                } else if (data.newValue == data.target.states.STATE_FORCING_LOW) {
                    data.target.playerDisplay.playAnimation('xuli', 1);
                } else if (data.newValue == data.target.states.STATE_FORCING_HIGH) {
                    data.target.playerDisplay.playAnimation('xuli2', 1);
                } else if (data.newValue == data.target.states.STATE_JUMPING) {
                    if (data.extra.vec.x > 0) {
                        data.target.playerIcon.scaleX = - (Math.abs(data.target.playerIcon.scaleX));
                    }
                    data.target.playerDisplay.playAnimation('tiao', 1);
                }
            }
        });
    },

    setState (state, extra = null) {
        if (this.state != state) {
            let oldState = this.state;
            this.state = state;
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

        if ((finalDist / this.maxLineLength) <= 0.5) {
            this.setState(this.states.STATE_FORCING_HIGH, {vec: vec});
        } else {
            this.setState(this.states.STATE_FORCING_LOW, {vec: vec});
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
        this.jumpStart = this.node.position;
        this.body.applyLinearImpulse(this.getActualVec(vec), this.body.getWorldCenter(), true);
        this.setState(this.states.STATE_JUMPING, {vec: vec});
    },

    lateUpdate (dt) {
        let currentPosition = this.node.position;
        if (this.positionList.length > this.tremblingFrames) {
            this.positionList.shift();
        }
        this.positionList.push(currentPosition);
        let varianceVec = this.calcPositionVariance(this.positionList);
        if (varianceVec.x < this.tremblingVariance.x && varianceVec.y < this.tremblingVariance.y) {
            if (!this.isForcing()) {
                this.setState(this.states.STATE_STILL);
            }
        } else {
            if (this.isFalling()) {
                if (currentPosition.y - this.originalPosition.y <= 1) {
                    this.jumpStart = this.originalPosition;
                    this.setState(this.states.STATE_STILL);
                    this.node.group = 'default';
                    this.setBoxesAlpha(255);

                    if (this.gameFinishCallback !== null) {
                        this.gameFinishCallback();
                    }
                }
            } else {
                if (currentPosition.y - this.jumpStart.y < -1) {
                    this.setState(this.states.STATE_FALLING);
                    this.node.group = 'falling'
                    this.setBoxesAlpha(100);
                }
            }
        }
        
    },

    getEvents() {
        return this.events;
    },

    isStill () {
        return this.state == this.states.STATE_STILL || this.isForcing();
    },

    isFalling() {
        return this.state == this.states.STATE_FALLING;
    },

    isForcing() {
        return this.state == this.states.STATE_FORCING_LOW 
         || this.state == this.states.STATE_FORCING_HIGH;
    },
});
