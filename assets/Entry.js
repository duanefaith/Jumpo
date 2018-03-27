window.shared = {};

window.shared.getFBInstant = function () {
	if (window.hasOwnProperty('FBInstant')) {
		return FBInstant;
	} else {
		return null;
	}
};

window.shared.testOptions = {};
window.shared.testOptions.roomHost = 'wss://server.jumpo.xyz:3000';

window.shared.getOptions = function () {
	return window.shared.testOptions;
};

cc.director.getPhysicsManager().enabled = true;