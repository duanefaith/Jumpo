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
        joinPrefab: {
            default: null,
            type: cc.Prefab
        }
    },

    onLoad() {
        this.inviteDialog = null;
        this.joinDialog = null;
        let self = this;
        window.shared.events.on('battle', function (event) {
            self.showJoinDialog(event.getUserData());
        });
    },

    start() {
        let entryData = Global.getEntryData();
        if (entryData) {
            if (entryData.type === 'battle_request' && entryData.roomId) {
                window.shared.events.emit('battle', { state: 0, roomId: entryData.roomId });
            }
        }
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

    showJoinDialog(data) {
        this.joinDialog = cc.instantiate(this.dialogPrefab);
        let joinDialogControl = this.joinDialog.getComponent('DialogControl');
        joinDialogControl.title = '加入PK';
        joinDialogControl.contentPrefabs.push(this.joinPrefab);
        let self = this;
        joinDialogControl.setOnDismissListener((dialog) => {
            self.joinDialog = null;
        });
        this.node.addChild(this.joinDialog, 100);
        let contentNode = this.node.getComponent('DialogControl').getContentNodes()[0];
        contentNode.getComponent('MultiPlayerJoinControl').setData(data);
        joinDialogControl.show(this.node);
    },
});
