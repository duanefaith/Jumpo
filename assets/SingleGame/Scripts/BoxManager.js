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
        maxBoxWidth: {
            default: 220
        },
        minBoxWidth: {
            default: 180
        },
        maxBoxHeight: {
            default: 220
        },
        minBoxHeight: {
            default: 180
        },
        generateMinLeftX: {
            default: -150
        },
        generateMaxRigthX: {
            default: 350
        },
        generateMaxInterval: {
            default: 260
        },
        generateMinInterval: {
            default: 240
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
            if (highestBoxTop > this.target.position.y) {
                return false;
            }

            for (let i = 0; i < this.onceCreatedCount; i ++) {
                let boxWidth = this.minBoxWidth + Math.random() * (this.maxBoxWidth - this.minBoxWidth);
                let boxHeight = this.minBoxHeight + Math.random() * (this.maxBoxHeight - this.minBoxHeight);
                let boxX = this.generateMinLeftX + Math.random() * (this.generateMaxRigthX  - this.generateMinLeftX  - boxWidth);
                let boxY = highestBoxTop + this.generateMinInterval + Math.random() * (this.generateMaxInterval - this.generateMaxInterval);

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

    },

    lateUpdate (dt) {
        if (this.autoCreate) {
            this.generateBox();
        }
    },

    setBoxesAlpha (alpha) {
        this.boxes.forEach((box) => {
            box.opacity = alpha;
        });
    },
});
