const GLOBAL_LEADERBOARD_NAME = 'jump_leader_global';

let currentPlayerInfo = null;

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

function readFile (response) {
	return new Promise((resolve, reject) => {
		try {
			let reader = new FileReader();
			reader.onload = function (event) {
				let res = event.target.result;
				resolve(res);
			}
			reader.readAsDataURL(response);
		} catch (error) {
			reject(error);
		}
	});
}

function loadHttpRequest (url) {
	return new Promise((resolve, reject) => {
		try {
			let xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.responseType = 'blob';
			xhr.onload = function (e) {
				resolve(xhr.response);
			};
			xhr.send();
		} catch (error) {
			reject(error);
		}
		
	});
};

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

function wxLogin() {
	return new Promise((resolve, reject) => {
		let instant = window.shared.getWXInstant();
		if (!instant) {
			resolve(null);
		} else {
			instant.login({
				success: function (res) {
					resolve(res.code);
				},
				fail: function (res) {
					reject(res);
				}
			});
		}
	});
}

function fetchOpenId(code) {
	return new Promise((resolve, reject) => {
		let instant = window.shared.getWXInstant();
		if (!instant) {
			resolve(null);
		} else {
			let xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function () {
				if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 206)) {
					let response = JSON.parse(xhr.responseText);
					if (response.error) {
						alert(JSON.stringify(response.error));
						resolve(null);
					} else {
						let player = {
							id: response.user.id
						};
						resolve(player);
					}
				}
			};
			xhr.open('POST', window.shared.getOptions().loginHost + '/users/login', true);
			xhr.responseType = 'text';
			xhr.send({code: code});
		}
	});
}

function getUserInfo() {
	return new Promise((resolve, reject) => {
		let instant = window.shared.getWXInstant();
		if (!instant) {
			resolve(null);
		} else {
			instant.getUserInfo({
				success: function (res) {
					resolve(res.userInfo);
				},
				fail: function (res) {
					reject(res);
				}
			});
		}
	});
}

module.exports.login = async function () {
	let instant = window.shared.getWXInstant();
	if (instant) {
		let code = await wxLogin();
		if (code) {
			let player = await fetchOpenId(code);
			if (player) {
				let userInfo = await getUserInfo();
				if (userInfo) {
					player.name = userInfo.nickName;
					player.photo = userInfo.avatarUrl;
				}
				currentPlayerInfo = player;
				return currentPlayerInfo;
			}
		}
	}
	return null;
};

module.exports.getCurrentPlayer = function () {
	let instant = window.shared.getFBInstant();
	if (instant) {
		return {
			id: instant.player.getID(),
			name: instant.player.getName(),
			photo: instant.player.getPhoto(),
		};
	} else {
		return currentPlayerInfo;
	}
};

module.exports.getCurrentPlayerScore = async function () {
	let leaderboard = await getGlobalLeaderboard();
	if (leaderboard != null) {
		let entry = await leaderboard.getPlayerEntryAsync();
		return fbEntryToScoreItem(entry);
	}
	return null;
};

module.exports.getPlayerScoresCount = async function () {
	let leaderboard = await getGlobalLeaderboard();
	if (leaderboard) {
		let count = await leaderboard.getEntryCountAsync();
		return count;
	}
	return 0;
};

module.exports.getPlayerScores = async function (count = 10, offset = 0) {
	let scores = {};
	let leaderboard = await getGlobalLeaderboard();
	if (leaderboard != null) {
		let entries = await leaderboard.getEntriesAsync(count, offset);
		if (entries != null && entries.length > 0) {
			entries.forEach((entry) => {
				let scoreItem = fbEntryToScoreItem(entry);
				scores[scoreItem.rank] = scoreItem;
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
		await instant.updateAsync({action: 'LEADERBOARD', name: GLOBAL_LEADERBOARD_NAME});
		return true;
	} catch (error) {
		console.log(error);
	}
	return false;
};

module.exports.shareContent = async function (text, image, data) {
	let instant = window.shared.getFBInstant();
	if (instant == null) {
		return false;
	}
	try {
		await instant.shareAsync({
			intent: 'REQUEST',
			image: image,
			text: text,
			data: data
		});
		return true;
	} catch (error) {
		console.log(error);
	}
	return false;
};

module.exports.loadImage = async function(url) {
	try{
		let response = await loadHttpRequest(url);
		if (response) {
			let result = await readFile(response);
			return result;
		}
	} catch (error) {
		console.log(error);
	}
};