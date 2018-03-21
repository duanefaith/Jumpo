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
        this.body = this.getComponent(cc.RigidBody);
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

        this.isFalling = false;
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
    },

    start () {
        this.still = true;
        this.positionList = [];
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

        // let forceRatio = 1 - finalDist / this.maxLineLength;
        // let scaleRatio = this.minScaleRatio + (1 - this.minScaleRatio) * forceRatio;
        // this.node.scaleY = scaleRatio * this.originalScaleY;
    },

    jump (vec) {
        this.graphicsPannel.clear();
        if (!this.isStill()) {
            return;
        }
        this.jumpStart = this.node.position;
        this.body.applyLinearImpulse(this.getActualVec(vec), this.body.getWorldCenter(), true);
    },

    lateUpdate (dt) {
        let currentPosition = this.node.position;
        if (this.positionList.length > this.tremblingFrames) {
            this.positionList.shift();
        }
        this.positionList.push(currentPosition);
        let varianceVec = this.calcPositionVariance(this.positionList);
        if (varianceVec.x < this.tremblingVariance.x && varianceVec.y < this.tremblingVariance.y) {
            this.still = true;
        } else {
            this.still = false;
        }

        if (this.isFalling) {
            if (currentPosition.y - this.originalPosition.y <= 1) {
                this.jumpStart = this.originalPosition;
                this.isFalling = false;
                this.node.group = 'default';
                this.setBoxesAlpha(255);
            }
        } else {
            if (currentPosition.y - this.jumpStart.y < -1) {
                this.isFalling = true;
                this.node.group = 'falling'
                this.setBoxesAlpha(100);
            }
        }
    },

    isStill () {
        return this.still;
    },
});
