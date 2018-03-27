const GLOBAL_LEADERBOARD_NAME = 'jump_leader_global';

async function getLeaderboard (name) {
	let instant = window.shared.getFBInstant();
	if (instant == null) {
		return null;
	}
	let leaderboard = await instant.getLeaderboardAsync(name);
	return leaderboard;
}

async function getGlobalLeaderboard () {
	let leaderboard = await getLeaderboard(GLOBAL_LEADERBOARD_NAME);
	return leaderboard;
}

function fbEntryToScoreItem (entry) {
	if (entry == null) {
		return null;
	}
	let scoreItem = {
		score: entry.getScore(),
		rank: entry.getRank(),
		player: {
			id: entry.getPlayer().getID(),
			name: entry.getPlayer().getName(),
			photo: entry.getPlayer().getPhoto()
		}
	};
	if (entry.getExtraData() != null) {
		scoreItem.ext = entry.getExtraData();
	}
	return scoreItem;
}

module.exports.getCurrentPlayer = function () {
	let instant = window.shared.getFBInstant();
	if (instant) {
		return {
			id: instant.player.getID(),
			name: instant.player.getName(),
			photo: instant.player.getPhoto(),
		};
	}
	return null;
};

module.exports.getCurrentPlayerScore = async function () {
	let leaderboard = await getGlobalLeaderboard();
	if (leaderboard != null) {
		let entry = await leaderboard.getPlayerEntryAsync();
		return fbEntryToScoreItem(entry);
	}
	return null;
};

module.exports.getPlayerScores = async function (count = 10, offset = 0) {
	let scores = [];
	let leaderboard = await getGlobalLeaderboard();
	if (leaderboard != null) {
		let entries = await leaderboard.getEntriesAsync(count, offset);
		if (entries != null && entries.length > 0) {
			entries.forEach((entry) => {
				scores.push(fbEntryToScoreItem(entry));
			});
		}
	}
	return scores;
};

module.exports.updateLeaderboard = async function (score, ext) {
	let leaderboard = await getGlobalLeaderboard();
	if (leaderboard != null) {
		try {
			let entry = await leaderboard.setScoreAsync(score, ext);
			return fbEntryToScoreItem(entry);
		} catch (error) {
			console.log(error);
		}
	}
	return null;
};

module.exports.postLeaderboardUpdate = async function() {
	let instant = window.shared.getFBInstant();
	if (instant == null) {
		return false;
	}
	try {
		await FBInstant.updateAsync({action: 'LEADERBOARD', name: GLOBAL_LEADERBOARD_NAME});
		return true;
	} catch (error) {
		console.log(error);
	}
	return false;
};