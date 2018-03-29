// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

const Global = require('Global');

cc.Class({
    extends: cc.Component,

    properties: {
        rankScrollView: {
            default: null,
            type: cc.Node
        },
        rankContent:{
            default: null,
            type: cc.Node
        },
        rankItemPrefab: {
            default: null,
            type: cc.Prefab
        },
        rankSelfView: {
            default: null,
            type: cc.Node
        },
    },

    onLoad () {
        var self = this;
        this.totalCount = 0;
        this.scoreItems = {};
        Global.getCurrentPlayerScore().then(function(scoreItem) {
            self.rankSelfView.getComponent('RankItemControl').initData(scoreItem);
        }).catch(function(err) {
            if (err) {
                alert(JSON.stringify(err));
            }
        });
        Global.getPlayerScoresCount().then(function(count) {
            if (count > 0) {
                self.totalCount = count;
                self.loadNewData(self);
            }
        }).catch(function(err) {
            if (err) {
                alert(JSON.stringify(err));
            }
        });
        this.rankScrollView.on('bounce-bottom', function () {
            self.loadNewData(self);
        });
    },

    loadNewData (self) {
        let currentItemsCount = Object.keys(self.scoreItems).length;
        let remaining = self.totalCount - currentItemsCount;
        if (remaining <= 0) {
            return false;
        }
        let fetchCount = remaining < 10 ? remaining : 10;
        Global.getPlayerScores(fetchCount, currentItemsCount).then(function(newScoreItems) {
            if (newScoreItems) {
                let keys = Object.keys(newScoreItems);
                if (keys.length > 0) {
                    keys.sort((a, b) => {
                        let x = (typeof(a) === 'string') ? parseInt(a) : a;
                        let y = (typeof(b) === 'string') ? parseInt(b) : b;
                        if (x > y) {
                            return 1;
                        } else if (x < y) {
                            return -1;
                        } else {
                            return 0;
                        }
                    }).forEach((key) => {
                        let newScoreItemView = cc.instantiate(self.rankItemPrefab);
                        self.rankContent.addChild(newScoreItemView);
                        newScoreItemView.getComponent('RankItemControl').initData(newScoreItems[key]);
                    });
                    Object.assign(self.scoreItems, newScoreItems);
                }
            }
        }).catch(function(err) {
            alert(JSON.stringify(err));
        });
        return true;
    },
});
