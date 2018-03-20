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
        autoCreate: {
            default: true
        },
        target: {
            default: null,
            type: cc.Node
        },
        boxPrefab: {
            default: null,
            type: cc.Prefab
        },
        camera: {
            default: null,
            type: cc.Camera
        },
        onceCreatedCount: {
            default: 2
        },
        minBoxSize: {
            default: cc.size(180, 180)
        },
        maxBoxSize: {
            default: cc.size(220, 220)
        },
        minBoxLeftX: {
            default: -150
        },
        maxBoxRigthX: {
            default: 350
        },
        minBoxYInterval: {
            default: 240
        },
        maxBoxYInterval: {
            default: 260
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.boxes = [];
        let originalPosition = this.target.position;
        this.generateBox = () => {
            let highestBoxTop = originalPosition.y;
            for (let box of this.boxes) {
                let top = box.position.y + box.height;
                if (top > highestBoxTop) {
                    highestBoxTop = top;
                }
            }
            if (highestBoxTop - this.target.position.y > this.onceCreatedCount * this.minBoxYInterval) {
                return false;
            }

            for (let i = 0; i < this.onceCreatedCount; i ++) {
                let boxWidth = this.minBoxSize.width + Math.random() * (this.maxBoxSize.width - this.minBoxSize.width);
                let boxHeight = this.minBoxSize.height + Math.random() * (this.maxBoxSize.height - this.minBoxSize.height);
                let boxX = this.minBoxLeftX + Math.random() * (this.maxBoxRigthX  - this.minBoxLeftX  - boxWidth);
                let boxY = highestBoxTop + this.minBoxYInterval + Math.random() * (this.maxBoxYInterval - this.minBoxYInterval);

                let newBox = cc.instantiate(this.boxPrefab);
                this.node.addChild(newBox);
                newBox.width = boxWidth;
                newBox.height = boxHeight;
                newBox.getComponent(cc.PhysicsBoxCollider).size = new cc.Size(boxWidth, boxHeight);
                newBox.getComponent(cc.PhysicsBoxCollider).apply();
                newBox.setPosition(new cc.Vec2(boxX, boxY));

                this.camera.addTarget(newBox);
                this.boxes.push(newBox);

                highestBoxTop = boxY + boxHeight;
            }

            return true;
        };
    },

    start () {
        this.score = 0;
    },

    lateUpdate (dt) {
        if (this.autoCreate) {
            this.generateBox();
        }
        let targetBody = this.target.getComponent(cc.RigidBody);
        if (!targetBody.awake) {
            let count = 0;
            for (let box of this.boxes) {
                if ((this.target.position.y - (box.position.y + box.height / 2)) >= -1) {
                    count = count + 1;
                }
            }
            this.score = count;
        }
    },

    setBoxesAlpha (alpha) {
        this.boxes.forEach((box) => {
            box.opacity = alpha;
        });
    },

    getScore () {
        return this.score;
    },
});
