// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

let Global = require('Global');

cc.Class({
    extends: cc.Component,

    properties: {
        gravity: {
            default: -320
        },
        playerControl: {
            default: null,
            type: cc.Node
        },
        castalNode: {
            default: null,
            type: cc.Node
        },
        camera: {
            default: null,
            type: cc.Camera
        },
        scoreLabel: {
            default: null,
            type: cc.Label
        },
        leftWallPrefab: {
            default: null,
            type: cc.Prefab
        },
        rightWallPrefab: {
            default: null,
            type: cc.Prefab
        },
        backgroundPrefab: {
            default: null,
            type: cc.Prefab
        },
        leftWallInitPosition: {
            default: new cc.Vec2(-289, 807)
        },
        rightWallInitPosition: {
            default: new cc.Vec2(289, 807)
        },
        backgroundInitPosition: {
            default: new cc.Vec2(0, 1447)
        },
        backgroundZIndex: {
            default: -3
        },
        wallZIndex: {
            default: -1
        },
        castalNodeZIndex: {
            default: -2
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.scoreLabel.node.zIndex = 1;

        cc.director.getPhysicsManager().gravity = new cc.Vec2(0, this.gravity)

        let startLocation = null;
        let lastLocation = null;
        this.castalNode.zIndex = this.castalNodeZIndex;
        this.node.on(cc.Node.EventType.TOUCH_START, e => {
            if (!window.shared.gameStarted) {
                return;
            }
            startLocation = e.touch.getLocation();
            lastLocation = startLocation;
        });
        this.node.on(cc.Node.EventType.TOUCH_MOVE, e => {
            if (!window.shared.gameStarted) {
                return;
            }
            let currentLocation = e.touch.getLocation();
            if (startLocation !== null) {
                this.playerControl.getComponent('PlayerControl').applyForce(
                    new cc.Vec2(startLocation.x - currentLocation.x, startLocation.y - currentLocation.y));
            }
            lastLocation = currentLocation;
        });
        this.node.on(cc.Node.EventType.TOUCH_END, e => {
            if (!window.shared.gameStarted) {
                return;
            }
            if (startLocation !== null) {
                let currentLocation = e.touch.getLocation();
                this.playerControl.getComponent('PlayerControl').jump(
                    new cc.Vec2(startLocation.x - currentLocation.x, startLocation.y - currentLocation.y));
                startLocation = null;
                lastLocation = null;
            }
        });
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, e => {
            if (!window.shared.gameStarted) {
                return;
            }
            if (startLocation !== null && lastLocation != null) {
                this.playerControl.getComponent('PlayerControl').jump(
                    new cc.Vec2(startLocation.x - lastLocation.x, startLocation.y - lastLocation.y));
                startLocation = null;
                lastLocation = null;
            }
        });

        this.leftWalls = [];
        this.rightWalls = [];
        this.backgrounds = [];

        this.getTopMostNode = (nodes) => {
            let topMostNode = null;
            for (let node of nodes) {
                if (topMostNode === null) {
                    topMostNode = node;
                } else {
                    if (topMostNode.y < node.y) {
                        topMostNode = node;
                    }
                }
            }
            return topMostNode;
        };
    },

    start () {
        let newLeftWall = cc.instantiate(this.leftWallPrefab);
        this.node.addChild(newLeftWall, this.wallZIndex);
        newLeftWall.setPosition(this.leftWallInitPosition);
        this.camera.addTarget(newLeftWall);
        this.leftWalls.push(newLeftWall);

        let newRightWall = cc.instantiate(this.rightWallPrefab);
        this.node.addChild(newRightWall, this.wallZIndex);
        newRightWall.setPosition(this.rightWallInitPosition);
        this.camera.addTarget(newRightWall);
        this.rightWalls.push(newRightWall);

        let newBackground = cc.instantiate(this.backgroundPrefab);
        this.node.addChild(newBackground, this.backgroundZIndex);
        newBackground.setPosition(this.backgroundInitPosition);
        this.camera.addTarget(newBackground);
        this.backgrounds.push(newBackground);

        this.playerControl.getComponent('PlayerControl').registerGameFinishCallback(() => {
            if (window.shared.gameStarted) {
                let finalScore = this.getComponent('BoxManager').getScore();
                Global.updateLeaderboard(finalScore, '').then((success) => {
                    if (success) {
                        console.log('updateLeaderboard succeed');
                    }
                    setTimeout(() => {
                         cc.director.loadScene('single_game');
                    }, 1000);
                });
            }
        });
    },

    lateUpdate (dt) {
        if (!window.shared.gameStarted) {
            return;
        }
        let topMostLeftWall = this.getTopMostNode(this.leftWalls);
        let topMostRightWall = this.getTopMostNode(this.rightWalls);
        let topMostBackground = this.getTopMostNode(this.backgrounds);
        let cameraPosition = this.camera.node.parent.position;

        if (topMostLeftWall !== null) {
            if (cameraPosition.y > topMostLeftWall.position.y) {
                let newLeftWall = cc.instantiate(this.leftWallPrefab);
                this.node.addChild(newLeftWall, this.wallZIndex);
                newLeftWall.setPosition(new cc.Vec2(topMostLeftWall.position.x, topMostLeftWall.position.y + topMostLeftWall.height));
                this.camera.addTarget(newLeftWall);
                this.leftWalls.push(newLeftWall);
            }
        }

        if (topMostRightWall !== null) {
            if (cameraPosition.y > topMostRightWall.position.y) {
                let newRightWall = cc.instantiate(this.rightWallPrefab);
                this.node.addChild(newRightWall, this.wallZIndex);
                newRightWall.setPosition(new cc.Vec2(topMostRightWall.position.x, topMostRightWall.position.y + topMostRightWall.height));
                this.camera.addTarget(newRightWall);
                this.rightWalls.push(newRightWall);
            }
        }

        if (topMostBackground !== null) {
            if (cameraPosition.y > topMostBackground.position.y) {
                let newBackground = cc.instantiate(this.backgroundPrefab);
                this.node.addChild(newBackground, this.backgroundZIndex);
                newBackground.setPosition(new cc.Vec2(topMostBackground.position.x, topMostBackground.position.y + topMostBackground.height));
                this.camera.addTarget(newBackground);
                this.backgrounds.push(newBackground);
            }
        }

        let score = this.getComponent('BoxManager').getScore();
        this.scoreLabel.string = score;
    },
});
