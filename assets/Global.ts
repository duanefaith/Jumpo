const GLOBAL_LEADERBOARD_NAME = 'jump_leader_global';
const LEADERBOARD_SCORE_KEY = 'leaderboard.key';

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
			type: 'fb',
			name: entry.getPlayer().getName(),
			photo: entry.getPlayer().getPhoto()
		}
	};
	if (entry.getExtraData() != null) {
		scoreItem.ext = entry.getExtraData();
	}
	return scoreItem;
}

function scoreItemFromKVArray (kvArray) {
	if (kvArray && kvArray.length > 0) {
		let score = 0;
		for (let kv of kvArray) {
			if (kv && kv.key == LEADERBOARD_SCORE_KEY) {
				score = parseInt(kv.value);
				break;
			}
		}
		let scoreItem = {score: score};
		let currentPlayer = module.exports.getCurrentPlayer();
		if (currentPlayer) {
			scoreItem.player = currentPlayer;
		}
		return scoreItem;
	}
	return null;
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

function postRequestInUrl(url, obj) {
	return new Promise((resolve, reject) => {
		let instant = window.shared.getWXInstant();
		if (!instant) {
			return null;
		}
		instant.request({
			url: url,
			data: obj,
			method: 'POST',
			success: function (res) {
				if (res.statusCode == 200 || res.statusCode == 206) {
					resolve(res.data);
				} else {
					reject(res.statusCode);
				}
			},
			fail: function (res) {
				reject(res);
			},
		});
		// let xhr = new XMLHttpRequest();
		// xhr.onreadystatechange = function () {
		// 	if (xhr.readyState == 4) {
		// 		if (xhr.status == 200 || xhr.status == 206) {
		// 			resolve(xhr.response);
		// 		} else {
		// 			reject(xhr.status);
		// 		}
		// 	}
		// };
		// xhr.open('POST', url, true);
		// xhr.responseType = 'json';
		// xhr.send(obj);
	});
}

function postRequestInPath(path, obj) {
	return postRequestInUrl(window.shared.getOptions().loginHost + path, obj);
}

async function fetchOpenId(code) {
	let instant = window.shared.getWXInstant();
	if (!instant) {
		return null;
	}
	let response = await postRequestInPath('/users/login', {code: code});
	if (response.error) {
		alert(JSON.stringify(response.error));
		return null;
	} else {
		let player = {
			id: response.user.id,
			type: 'wx',
		};
		return player;
	}
}

async function getCurrentScoreItemFromServer() {
	if (currentPlayerInfo) {
		let response = await postRequestInPath('/users/score/query_me', {player: currentPlayerInfo});
		return response;
	} else {
		return null;
	}
}

async function saveScoreToServer(score) {
	if (currentPlayerInfo) {
		let response = await postRequestInPath('/users/score/update', {score: score, player: currentPlayerInfo});
		if (response.error) {
			alert(JSON.stringify(response.error));
			return null;
		} 
		return response;
	} else {
		return null;
	}
}

async function getPlayerScoresCountFromServer() {
	let response = await postRequestInPath('/users/score/query_count', {});
	if (response.error) {
		alert(JSON.stringify(response.error));
		return 0;
	}
	return response.count;
}

async function getPlayerScoresFromServer(start, count) {
	let response = await postRequestInPath('/users/score/query_page', {start: start, count: count});
	if (response.error) {
		alert(JSON.stringify(response.error));
		return null;
	}
	let result = {};
	if (response.data && response.data.length > 0) {
		response.data.forEach(function (scoreItem) {
			result[scoreItem.rank] = scoreItem;
		});
	}
	return result;
}

function getUserInfo () {
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

function shareAppMsg (title, imagePath, query) {
	return new Promise((resolve, reject) => {
		let instant = window.shared.getWXInstant();
		if (!instant) {
			resolve(null);
		} else {
			instant.shareAppMessage({
				title: title,
				imageUrl: imagePath,
				query: query,
				success: function () {
					resolve(true);
				},
				fail: function () {
					resolve(false);
				},
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
					player.photo = userInfo.avatarUrl + '?aaa=aa.jpg';
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
			type: 'fb',
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
	let scoreItem = await getCurrentScoreItemFromServer();
	return scoreItem;
};

module.exports.getPlayerScoresCount = async function () {
	let leaderboard = await getGlobalLeaderboard();
	if (leaderboard) {
		let count = await leaderboard.getEntryCountAsync();
		return count;
	}
	let count = await getPlayerScoresCountFromServer();
	return count;
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
	} else {
		scores = await getPlayerScoresFromServer(offset, count);
	}
	return scores;
};

module.exports.updateLeaderboard = async function (score, ext) {
	let leaderboard = await getGlobalLeaderboard();
	if (leaderboard != null) {
		try {
			let entry = await leaderboard.setScoreAsync(score, ext);
			if (entry) {
				return fbEntryToScoreItem(entry);
			}
		} catch (error) {
			console.log(error);
		}
	}

	let scoreItem = await saveScoreToServer(score);
	return scoreItem;
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

module.exports.shareContent = async function (text, imagePath, data) {
	let instant = window.shared.getFBInstant();
	if (instant) {
		try {
			let imageData = await module.exports.loadImage(imagePath);
			await instant.shareAsync({
				intent: 'REQUEST',
				image: imageData,
				text: text,
				data: data
			});
			return true;
		} catch (error) {
			console.log(error);
		}
	} else if (window.shared.getWXInstant()) {
		let query;
		if (data) {
			query = '';
			let keys = Object.keys(data);
			for (var i = 0; i < keys.length; i ++) {
				if (i > 0) {
					query = query + '&';
				}
				query = query + keys[i] + '=' + data[keys[i]];
			}
		}
		let result = await shareAppMsg(text, imagePath, query);
		return result;
	}
	return false;
};

module.exports.getEntryData = function () {
	let instant = window.shared.getFBInstant();
	if (instant) {
		return instant.getEntryPointData()
	}
	return null;
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