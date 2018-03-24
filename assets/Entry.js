window.shared = {};

window.shared.getFBInstant = function () {
	if (window.hasOwnProperty('FBInstant')) {
		return FBInstant;
	} else {
		return null;
	}
};

cc.director.getPhysicsManager().enabled = true;