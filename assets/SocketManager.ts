const EventEmitter = require('events').EventEmitter;
const States = require('StateConstants').SOCKET;

function SocketManager() {
	this.state = States.NOT_CONNECTED;
	this.events = new EventEmitter();
	this.roomSocket = null;
	this.roomExtra = {};
	this.roomSocketTrial = 0;
	WebSocket.prototype.sendObj = function(obj) {
		if (obj) {
			try {
				this.send(JSON.stringify(obj));
			} catch (error) {
				console.log(error);
			}
		}
	};
}

SocketManager.prototype.getEvents = function () {
	return this.events;
};

SocketManager.prototype.setState = function (state) {
	let oldState = this.state;
	this.state = state;
	this.events.emit('property_changed', this, 'state', oldState, state);
};

SocketManager.prototype.getState = function () {
	return this.state;
};

SocketManager.prototype.connectRoom = function () {
	console.log('connecting on state ' + this.getState());
	if (this.state === States.NOT_CONNECTED) {
		this.setState(States.CONNECTING_ROOM);
		if (this.roomSocket) {
			this.roomSocket.close();
		}
		let options = window.shared.getOptions();
		this.roomSocket = new WebSocket(options.roomHost);
		var self = this;
		this.roomSocket.onopen = function (event) {
			console.log('onpen');
			self.roomExtra = {};
			self.setState(States.ROOM_CONNECTED);
			self.events.emit('room_connected');
		};
		this.roomSocket.onmessage = function (event) {
			console.log('onmessage');
			if (event && event.data) {
				let jsonData = null;
				try {
					jsonData = JSON.parse(event.data);
				} catch (error) {
					console.log(error);
				}
				if (jsonData 
					&& jsonData.hasOwnProperty('type')) {
					if (jsonData.type === 0) {
						// response
						self.events.emit('room_resp', jsonData.req, jsonData.result);
					} else if (jsonData.type == 1) {
						// push
						self.events.emit('room_push', jsonData.data);
					}
				}
			}
		};
		this.roomSocket.onerror = function (event) {
			console.log('onerror');
			self.setState(SocketManager.States.NOT_CONNECTED)
			if (self.roomSocketTrial <= 3) {
				self.roomSocketTrial ++;
				self.connectRoom();
			} else {
				self.roomSocketTrial = 0;
				self.events.emit('room_connect_error');
			}
		};
		this.roomSocket.onclose = function (event) {
			console.log('onclose');
			self.setState(States.NOT_CONNECTED)
			self.events.emit('room_connect_close');
		};
		return true;
	}
	return false;
};

SocketManager.prototype.sendToRoomSocket = function (type, data) {
	if (this.state === States.ROOM_CONNECTED) {
		this.roomSocket.sendObj({
			type: type,
			data: data
		});
		return true;
	}
	return false;
};

SocketManager.prototype.saveToRoomExtra = function (key, obj) {
	if (key && obj) {
		this.roomExtra[key] = obj;
	}
};

SocketManager.prototype.getRoomExtra = function (key) {
	if (key) {
		return this.roomExtra[key];
	}
};

module.exports = function () {
	let instance;
	return {
		getInstance: function() {
			if (!instance) {
				instance = new SocketManager();
			}
			return instance;
		}
	};
}();