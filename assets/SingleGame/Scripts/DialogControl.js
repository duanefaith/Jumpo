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
        titleLabel: {
            default: null,
            type: cc.Label
        },
        dialogOuter: {
            default: null,
            type: cc.Node
        },
        dialogInner: {
            default: null,
            type: cc.Node
        },
        dialogBtnLayout: {
            default: null,
            type: cc.Node
        },
        title: {
            default: ''
        },
        contentPrefabs: {
            default: [],
            type: [cc.Prefab]
        },
        btnPrefabs: {
            default: [],
            type: [cc.Prefab]
        },
        commonPrefabs: {
            default: [],
            type: [cc.Prefab]
        },
    },

    onLoad () {
        this.hidden = true;
        this.isAnimating = false;
        this.animation = this.dialogOuter.getComponent(cc.Animation);
        let self = this;
        this.commonPrefabs.forEach((prefab) => {
            let component = cc.instantiate(prefab);
            self.node.addChild(component);
        });
        this.contentPrefabs.forEach((prefab) => {
            let component = cc.instantiate(prefab);
            self.dialogInner.addChild(component);
        });
        this.btnPrefabs.forEach((prefab) => {
            let component = cc.instantiate(prefab);
            self.dialogBtnLayout.addChild(component);
        });
        this.onShowListener = null;
        this.onDismissListener = null;
    },

    setOnShowListener (listener) {
         this.onShowListener = listener;
    },

    setOnDismissListener (listener) {
         this.onDismissListener = listener;
    },

    show () {
        if (!this.hidden || this.isAnimating) {
            return;
        }
        let self = this;
        this.animation.once('stop', function(e) {
            if (e.getUserData().clip.name == 'dialog_pop_out') {
                if (self.onShowListener) {
                    self.onShowListener(self);
                }
                self.isAnimating = false;
                self.hidden = false;
            }
        });
        this.isAnimating = true;
        this.animation.play('dialog_pop_out');
    },

    dismiss () {
        if (this.hidden || this.isAnimating) {
            return;
        }
        let self = this;
        this.animation.once('stop', function(e) {
            if (e.getUserData().clip.name == 'dialog_dismiss') {
                if (self.onDismissListener) {
                    self.onDismissListener(self);
                }
                self.isAnimating = false;
                self.hidden = true;
                self.node.removeFromParent();
            }
        });
        this.isAnimating = true;
        this.animation.play('dialog_dismiss');
    },
});
