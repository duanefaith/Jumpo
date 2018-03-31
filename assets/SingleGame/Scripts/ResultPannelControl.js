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
        successPrefab: {
            default: null,
            type: cc.Prefab
        },
        failPrefab: {
            default: null,
            type: cc.Prefab
        },
        singleResultPrefab: {
            default: null,
            type: cc.Prefab
        },
        backgroundPannel: {
            default: null,
            type: cc.Node
        },
        scoreLabel: {
            default: null,
            type: cc.Label
        },
        historyLabel: {
            default: null,
            type: cc.Label
        },
    },

    onLoad () {
        this.backgroundPannel.zIndex = -100;
    },

    initData (caller, result) {
        this.caller = caller;
        if (result) {
            if (result.score) {
                this.scoreLabel.string = result.score;
            }
            if (result.historyScore) {
                this.historyLabel.string = result.historyScore;
            }

            let pannel;
            if (result.multi) {
                if (result.score > result.historyScore) {
                    pannel = cc.instantiate(this.successPrefab);
                } else {
                    pannel = cc.instantiate(this.failPrefab);
                }
            } else {
                pannel = cc.instantiate(this.singleResultPrefab);
            }
            this.node.addChild(pannel, -1);
        }
    },

    closeSelf (action) {
        if (this.caller) {
            this.caller.hideResultPannel(this.caller, action);
        }
    },

});
