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
        starPrefab: {
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
        },
        createStarRatio: {
            default: 0.5
        },
        horizontalStarDist: {
            default: 80
        },
        minStarX: {
            default: -385
        },
        maxStarX: {
            default: 385
        },
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
                let xPositionRand = Math.random();
                if (xPositionRand < 0.1) {
                    xPositionRand = 0;
                } else if (xPositionRand > 0.9) {
                    xPositionRand = 1;
                }

                let boxWidth = this.minBoxSize.width + Math.random() * (this.maxBoxSize.width - this.minBoxSize.width);
                let boxHeight = this.minBoxSize.height + Math.random() * (this.maxBoxSize.height - this.minBoxSize.height);
                let boxX = this.minBoxLeftX + boxWidth / 2 + xPositionRand * (this.maxBoxRigthX - this.minBoxLeftX - boxWidth);
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
                this.createStars(newBox);

                highestBoxTop = boxY + boxHeight;
            }

            return true;
        };

        this.createStars = (box) => {
            let sideRand = Math.random();
            let rands = [Math.random(), Math.random(), Math.random()];

            let starPositions = [];
            if (sideRand < (1 / 3)) {
                let starX = box.position.x - box.width / 2 - this.horizontalStarDist;
                if (starX <= this.minStarX) {
                    return;
                }
                if (rands[0] <= this.createStarRatio) {
                    starPositions.push(new cc.Vec2(starX, box.position.y - box.height / 3));
                }
                if (rands[1] <= this.createStarRatio) {
                    starPositions.push(new cc.Vec2(starX, box.position.y));
                }
                if (rands[2] <=  this.createStarRatio) {
                    starPositions.push(new cc.Vec2(starX, box.position.y + box.height / 3));
                }
            } else if (sideRand < (2 / 3)) {
                let starX = box.position.x;
                if (rands[0] <= this.createStarRatio) {
                    starPositions.push(new cc.Vec2(starX, box.position.y + 5 * box.height / 6));
                }
                if (rands[1] <= this.createStarRatio) {
                    starPositions.push(new cc.Vec2(starX, box.position.y + 7 * box.height / 6));
                }
                if (rands[2] <= this.createStarRatio) {
                    starPositions.push(new cc.Vec2(starX, box.position.y + 9 * box.height / 6));
                }
            } else {
                let starX = box.position.x + box.width / 2 + this.horizontalStarDist;
                if (starX >= this.minStarX) {
                    return;
                }
                if (rands[0] <= this.createStarRatio) {
                    starPositions.push(new cc.Vec2(starX, box.position.y - box.height / 3));
                }
                if (rands[1] <= this.createStarRatio) {
                    starPositions.push(new cc.Vec2(starX, box.position.y));
                }
                if (rands[2] <= this.createStarRatio) {
                    starPositions.push(new cc.Vec2(starX, box.position.y + box.height / 3));
                }
            }

            let self = this;
            starPositions.forEach((position) => {
                console.log(position);
                let newStar = cc.instantiate(self.starPrefab);
                self.node.addChild(newStar);
                newStar.getComponent('StarControl').players.push(this.target);
                newStar.setPosition(position);
                newStar.getComponent('StarControl').setCallback(function (star, player) {
                    self.starScore = self.starScore + 1;
                });

                self.camera.addTarget(newStar);
            });
        };
    },

    start () {
        this.score = 0;
        this.starScore = 0;
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
        return this.score + this.starScore;
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
