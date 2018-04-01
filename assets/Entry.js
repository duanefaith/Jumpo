window.shared = {};

window.shared.getFBInstant = function () {
	if (window.hasOwnProperty('FBInstant')) {
		return FBInstant;
	} else {
		return null;
	}
};

window.shared.getWXInstant = function () {
	if (window.hasOwnProperty('wx')) {
		return wx;
	} else {
		return null;
	}
};

if (window.shared.getWXInstant()) {
	window.alert = function (msg) {
		window.shared.getWXInstant().showModal({
			title: '提示',
			content: msg,
			showCancel: false,
			cancelText: '取消',
			confirmText: '确认',
		});
	};
}

window.shared.options = {};
window.shared.options.roomHost = 'wss://xyx11.lilithgame.com';
window.shared.options.loginHost = 'https://xyx10.lilithgame.com';

window.shared.getOptions = function () {
	return window.shared.options;
};

cc.director.getPhysicsManager().enabled = true;