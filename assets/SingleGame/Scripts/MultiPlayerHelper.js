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
        dialogPrefab: {
            default: null,
            type: cc.Prefab
        },
        inviteContentPrefab: {
            default: null,
            type: cc.Prefab
        },
        inviteBtnPrefab: {
            default: null,
            type: cc.Prefab
        },
    },

    onLoad() {
        this.inviteDialog = null;
    },

    showInviteDialog () {
        this.inviteDialog = cc.instantiate(this.dialogPrefab);
        let inviteDialogControl = this.inviteDialog.getComponent('DialogControl');
        inviteDialogControl.title = '发起双人PK';
        inviteDialogControl.contentPrefabs.push(this.inviteContentPrefab);
        inviteDialogControl.btnPrefabs.push(this.inviteBtnPrefab);
        let self = this;
        inviteDialogControl.setOnDismissListener((dialog) => {
            self.inviteDialog = null;
        });
        this.node.addChild(this.inviteDialog, 100);
        inviteDialogControl.show(this.node);
    },
});
