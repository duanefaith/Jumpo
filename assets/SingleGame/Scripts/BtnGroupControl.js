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
        btnGroup: {
            default: null,
            type: cc.Node
        },
        startGameBtn: {
            default: null,
            type: cc.Button
        },
        leaderBoardBtn: {
            default: null,
            type: cc.Button
        },
        shareBtn: {
            default: null,
            type: cc.Button
        },
        presentsBtn: {
            default: null,
            type: cc.Button
        },
        multiPlayerBtn: {
            default: null,
            type: cc.Button
        },
    },

    onLoad () {
        this.btnGroupHidden = true;
        this.isAnimating = false;
        this.showBtnGroup();
    },

    showBtnGroup () {
        if (!this.btnGroupHidden || this.isAnimating) {
            return;
        }
        window.shared.gameStarted = false;
        this.startGameBtn.interactable = false;
        this.leaderBoardBtn.interactable = false;
        this.shareBtn.interactable = false;
        this.presentsBtn.interactable = false;
        this.multiPlayerBtn.interactable = false;
        var self = this;
        this.btnGroup.getComponent(cc.Animation).once('stop', function(e) {
            if (e.getUserData().clip.name == 'btn_group_show') {
                self.isAnimating = false;
                self.btnGroupHidden = false;
                self.startGameBtn.interactable = true;
                self.leaderBoardBtn.interactable = true;
                self.shareBtn.interactable = true;
                self.presentsBtn.interactable = true;
                self.multiPlayerBtn.interactable = true;
            }
        });
        this.isAnimating = true;
        this.btnGroup.getComponent(cc.Animation).play('btn_group_show');
    },

    hideBtnGroup () {
        if (this.btnGroupHidden || this.isAnimating) {
            return;
        }
        var self = this;
        this.btnGroup.getComponent(cc.Animation).once('stop', function(e) {
            if (e.getUserData().clip.name == 'btn_group_hide') {
                self.isAnimating = false;
                self.btnGroupHidden = true;
                window.shared.gameStarted = true;
                window.shared.events.emit('game_started');
            }
        });
        this.startGameBtn.interactable = false;
        this.leaderBoardBtn.interactable = false;
        this.shareBtn.interactable = false;
        this.presentsBtn.interactable = false;
        this.multiPlayerBtn.interactable = false;
        this.isAnimating = true;
        this.btnGroup.getComponent(cc.Animation).play('btn_group_hide');
    },
});
