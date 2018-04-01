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
        rankView: {
            default: null,
            type: cc.Sprite
        },
        rankLabel: {
            default: null,
            type: cc.Label
        },
        rankPlayerThumb: {
            default: null,
            type: cc.Sprite
        },
        rankPlayerName: {
            default: null,
            type: cc.Label
        },
        rankPlayerScore: {
            default: null,
            type: cc.Label
        },
        rankSprites: {
            default: [],
            type: [cc.SpriteFrame]
        }
    },

    initData (scoreItem) {
        if (scoreItem) {
            if (scoreItem.rank && scoreItem.rank <= this.rankSprites.length) {
                this.rankView.enabled = true;
                this.rankView.spriteFrame = this.rankSprites[scoreItem.rank - 1];
                this.rankLabel.enabled = false;
            } else {
                this.rankLabel.enabled = true;
                this.rankLabel.string = scoreItem.rank;
                this.rankView.enabled = false;
            }
            if (scoreItem.score) {
                this.rankPlayerScore.string = scoreItem.score;
            }
            if (scoreItem.player) {
                if (scoreItem.player.name) {
                    this.rankPlayerName.string = scoreItem.player.name;
                }
                if (scoreItem.player.photo) {
                    let self = this;
                    try {
                        cc.loader.load(scoreItem.player.photo, function (err, texture) {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            if (texture) {
                                self.rankPlayerThumb.spriteFrame = new cc.SpriteFrame(texture);
                            }
                        });
                    } catch (error) {
                         console.log(error);
                    }
                }
            }
        }
    },
});
