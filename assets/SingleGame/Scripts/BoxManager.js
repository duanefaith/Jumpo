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
        connectNodePrefab: {
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
        this.connectNodes = {};
        let originalPosition = this.target.position;
        this.generateBox = () => {
            let highestBoxTop = originalPosition.y - this.target.height / 2;
            for (let box of this.boxes) {
                let top = box.position.y + box.height / 2;
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
                let boxX = this.minBoxLeftX + boxWidth / 2 + Math.random() * (this.maxBoxRigthX - this.minBoxLeftX - boxWidth);
                let boxY = highestBoxTop + this.minBoxYInterval + boxHeight / 2 + Math.random() * (this.maxBoxYInterval - this.minBoxYInterval);

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
        this.highestReachedBox = null;
    },

    lateUpdate (dt) {
        if (this.autoCreate) {
            this.generateBox();
        }
        if (this.target.getComponent('PlayerControl').isStill()) {
            let count = 0;
            let highestReachedBox = null;
            for (let box of this.boxes) {
                if ((this.target.position.y - this.target.height / 2 - (box.position.y - box.height / 2)) >= -1) {
                    count = count + 1;
                    if (highestReachedBox == null || box.position.y > highestReachedBox.position.y) {
                        highestReachedBox = box;
                    }
                }
            }

            this.score = count;
            this.highestReachedBox = highestReachedBox;
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

    getHighestReachedBox () {
        return this.highestReachedBox;
    },

    findNearestBox (y, lowestBox = null) {
        let boxDist = null;
        let nearestBox = null;
        for (let box of this.boxes) {
            if (lowestBox && lowestBox.position.y - box.position.y > -1) {
                continue;
            }
            let boxTop = box.position.y + box.height / 2;
            let dist  = Math.abs(boxTop - y);
            if (boxDist == null || dist < boxDist) {
                boxDist = dist;
                nearestBox = box;
                if (dist == 0) {
                    break;
                }
            }
        }
        return {
             box: nearestBox,
             dist: boxDist
        };
    },

    hasConnectedNode (box, left = true) {
        if (this.connectNodes.hasOwnProperty(box.position.y)) {
            return this.connectNodes[box.position.y].hasOwnProperty(left ? 'left' : 'right');
        }
        return false;
    },

    createConnectedNode (box, left = true) {
         let newConnectNode = cc.instantiate(this.connectNodePrefab);
         this.node.addChild(newConnectNode);
         let nodeX;
         if (left) {
            nodeX = box.position.x - box.width / 2 - newConnectNode.width / 2;
         } else {
            nodeX = box.position.x + box.width / 2 + newConnectNode.width / 2;
         }
         let nodeY = box.position.y + box.height / 2 - newConnectNode.height / 2;
         newConnectNode.setPosition(nodeX, nodeY);
         if (!this.connectNodes.hasOwnProperty(box.position.y)) {
            this.connectNodes[box.position.y] = {};
         }
         this.camera.addTarget(newConnectNode);
         this.connectNodes[box.position.y][left ? 'left' : 'right'] = newConnectNode;
         return newConnectNode;
    },

    removeConnectedNode (box, left = true) {
        if (this.connectNodes.hasOwnProperty(box.position.y)) {
            let subNodeName = (left ? 'left' : 'right');
            let subNode = this.connectNodes[box.position.y][subNodeName];
            if (subNode) {
                this.camera.removeTarget(subNode);
                subNode.removeFromParent();
            }
            delete this.connectNodes[box.position.y][subNodeName];
            return true;
        }
        return false;
    },
});
