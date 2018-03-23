cc.director.getPhysicsManager().enabled = true;

const GLOBAL_LEADERBOARD_NAME = 'jump_leader_global';

async function getLeaderboard (name) {
	let leaderboard = await FBInstant.getLeaderboardAsync(name);
	return leaderboard;
}

async function getGlobalLeaderboard () {
	let leaderboard = await getLeaderboard(GLOBAL_LEADERBOARD_NAME);
	return leaderboard;
}

module.exports.initConfig = {
	useFacebook: false
};

module.exports.updateLeaderboard = async function (score, ext) {
	if (module.exports.initConfig.useFacebook) {
		let leaderboard = await getGlobalLeaderboard();
		if (leaderboard != null) {
			try {
				await leaderboard.setScoreAsync(score, ext);
			} catch (error) {
				console.log(error);
				return false;
			}
			return true;
		}
	}
	return false;
}