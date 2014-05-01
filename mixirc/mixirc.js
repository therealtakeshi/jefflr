// Required Modules
var http = require('http');
var fs = require('fs');
var request = require('request');
var querystring = require('querystring');
var websock = require('ws');
var irc = require('irc');

// General bot configuration
var ircNick = "jefflrbot";
var ircChannel = "#jeffdrives";
var ircServer = "irc.freenode.org";
var channelId = 27902;

// Advanced bot configuration
// See http://api.mixlr.com/users/jeff-gerstmann for example channelId ("id")
var userAgent = "Mixlr Chatbox <3";
//var firebaseDomain = '';

// Fancy user class, might implement along with Firebase.
//function user(nick, mixlrUserLogin, mixlrAuthSession) {
//	this.nick = nick;
//	this.mixlrUserLogin = mixlrUserLogin;
//	this.mixlrAuthSession = mixlrAuthSession;
//]}
//}

//ignore.prototype.add(name) {
//	this.ignoreList.concat(name);
//}

//ignore.prototype.check = function (name) {
//	return this.ignoreList.indexOf(name);
//}

// Won't Mixlr => IRC relay if from these usernames
ignoreList = [
	"Minnie Marabella",
	"WERD SLLIM"
];

// Users for IRC => Mixlr relay
userList = {
	"BobBarker": {
		"mixlrUserLogin": "",
		"mixlrAuthSession": ""
		"canHeart": true
	},
	"Hajitorus": {
		"mixlrUserLogin": "",
		"mixlrAuthSession": ""
		"canHeart": true
	}
};

// Creates the IRC client with given params;
var ircBot = new irc.Client(
	ircServer,
	ircNick,
	{
		password: null,
		userName: ircNick,
		realName: ircNick,
		port: 6667,
		debug: false,
		showErrors: false,
		autoRejoin: true,
		autoConnect: true,
		channels: [ircChannel],
		retryCount: null,
		retryDelay: 2000,
		secure: false,
		selfSigned: false,
		certExpired: false,
		floodProtection: true,
		floodProtectionDelay: 200,
		sasl: false,
		stripColors: false,
		channelPrefixes: "&#",
		messageSplit: 512
	}
);

// Simple pushing to Firebase, with fail and success callbacks;
// Can be called in getUserData(), but isn't currently;
//
// TODO: set up proper auth scheme;
//function firebasePush(firebaseDomain, child, payload, fail, success) {
//	var Firebase = require('firebase'),
//		firebaseRoot = new Firebase(firebaseDomain);
//	firebaseRoot.child(child).push(payload, function(err) {
//		if (err) {
//			eval(fail);
//		} else {
//			eval(success);
//		}
//	});
//}

// Polls mixlr API and pulls back 50 most-recent comments;
/* function getUserData(broadcasterName, cb) {
	request('http://api.mixlr.com/users/' + broadcasterName + '?include_comments=true', function(err, res, body) {
		comments = JSON.parse(body).live_page_comments;
		for (var i = comments.length - 1; i >= 0; i--) {
			date = process.hrtime();
			// comments[i].comm = comments[i];
			// firebasePush("mixlr-comments",comments[i],console.log("Failed."),console.log("Success on #" + i));
			console.log("Length: " + comments.length);
		}
		return 'done';
	}).on('done', function() {
		console.log("Process complete.");
		process.exit(code = 0);
	});
} */

/* function joinCrowd(broadcasterName, userLogin, userSession) {
	request('http://api.mixlr.com/users/' + broadcasterName + '?include_comments=true', function(err, res, body) {
		comments = JSON.parse(body).live_page_comments;
		for (var i = comments.length - 1; i >= 0; i--) {
			date = process.hrtime();
			// comments[i].comm = comments[i];
			// firebasePush("mixlr-comments",comments[i],console.log("Failed."),console.log("Success on #" + i));
			console.log("Length: " + comments.length);
		}
		return 'done';
	}).on('done', function() {
		console.log("Process complete.");
		process.exit(code = 0);
	});
} */

function ircInitBot() {
	ircBot.addListener('message', function (from, to, message) {
		console.log('%s => %s: %s', from, to, message);
		if (from !== ircBot.nick) {
			Object.keys(userList).forEach(function (user) {
				// console.log(user, userList[user].mixlrUserLogin, userList[user].mixlrAuthSession);
				if (from === user) {
					if (message.toLowerCase() === "sup "+ircBot.nick) {
						ircBot.say(to, "OH YOU KNOW JUST ENSLAVING THE HUMAN RACE");
					
					// NOTE: The Regex below only returns true if the message is ".#" (# = number of any size)
					} else if (/^(\.[0-9]+)$/.test(message) && userList[user].canHeart) {
						var commentId = message.replace(".", "");
						console.log("IRC => postAddCommentHeart: ", user, commentId, message, channelId, userList[user].mixlrUserLogin, userList[user].mixlrAuthSession);
						postAddCommentHeart(commentId, userList[user]);
					} else {
						console.log("IRC => postComm: ", user, message, channelId, userList[user].mixlrUserLogin, userList[user].mixlrAuthSession);
						postComm(message, channelId, userList[user]);
					}
				}
			});
		}
	});
}

function sendHTTP (httpHeader, data) {
	var httpReq = http.request(httpHeader, function(res) {
		res.setEncoding('UTF-8');
	});

	// Send HTTP POST
	httpReq.write(data);
	httpReq.end();
}

// Forms HTTP headers and data for IRC => Mixlr comment relay, sends to sendHTTP.
function postComm(comment, channelId, user) {
	console.log("postComm => Mixlr: ", user.mixlrUserLogin, user.mixlrAuthSession, comment);
	var comm = {
		// Just adds the comment param to the form;
		"comment[content]": comment,
		// This will be per-broadcaster, obviously;
		// Can probably grab from getUserData();
		"comment[broadcaster_id]": channelId,
		// // Socket ID needs to be per-user, probably.
		// "comment[exclude_socket_id]":"",
		// // Needs to be grabbed from getUserData();
		// // Otherwise might not need to be sent at all;
		// "comment[broadcaster_not_in_room]":1,
		// // Probably can cross-post to social media? Not sure;
		// "comment[explicitly_shared]":0,
		// // Default on actual comment was 1;
		// // Unsure what exactly this means;
		// "comment[do_not_publish]":1,
		};

	// Build the post string from an object
	var postData = querystring.encode(comm);

	// An object of options to indicate where to post to
	var httpHeader = {
		hostname: 'mixlr.com',
		path: '/comments',
		method: 'POST',
		headers: {
			"X-Requested-With": "XMLHttpRequest",
			"User-Agent": userAgent,
			"Content-type": "application/x-www-form-urlencoded",
			"Accept": 'text/plain',
			"Cookie": 'mixlr_user_login=' + user.mixlrUserLogin + '; mixlr_session=' + user.mixlrAuthSession
		}
	};

	// Send HTTP POST
	sendHTTP(httpHeader, postData);
}

// Forms HTTP headers and data for IRC => Mixlr comment hearting, sends to sendHTTP.
function postAddCommentHeart(commentId, user) {
	console.log("postAddCommentHeart =>", commentId, user);

	var httpHeader = {
		hostname: "mixlr.com",
		path: "/comments/"+commentId+"/heart",
		method: "POST",
		headers: {
			"X-Requested-With": "XMLHttpRequest",
			"User-Agent": userAgent,
			"Content-Type": "application/x-www-form-urlencoded",
			"Accept": "text/plain",
			"Cookie": "mixlr_user_login="+user.mixlrUserLogin+"; mixlr_session="+user.mixlrAuthSession
		}
	};
	console.log(httpHeader);

	// Send HTTP POST
	sendHTTP(httpHeader, "");
}

// Opens a websocket connection and receives data as long as the connection remains open;
// TODO: add in the ping function (seems to be every 5 minutes);
function openSock(channelId) {
	var broadcastStart = false;

	var channelSocket = JSON.stringify({
		"event":"pusher:subscribe",
		"data":{
			"channel":"production;user;"+channelId
		}
	});
	
	var ws = new websock('ws://ws.pusherapp.com/app/2c4e9e540854144b54a9?protocol=5&client=js&version=1.12.7&flash=false');

	ws.on('open', function() {
		console.log("Connected.");
		ws.send(channelSocket);
	});

	ws.on('message', function(message) {
		console.log('Received: %s', message);
		try {
			m = JSON.parse(message);
		}
		catch(err) {
			console.log("JSON.parse(message) failed: "+err.message);
		}

		switch(m.event) {
			case "comment:created":
				try {
					// NOTE: decodeURIComponent() will throw an exception if it finds an unencoded '%' character, unescape does not.
						//var a = JSON.parse(decodeURIComponent(m.data));
					var a = JSON.parse(unescape(m.data));
				}
				catch(err) {
					console.log("JSON.parse(unescape(m.data)) failed: "+err.message);
				}
			
				if (ignoreList.indexOf(a.name) === -1 ) {
					try {
						id = a.id;
						var ircSay = irc.colors.wrap("light_gray", "[");
						ircSay += irc.colors.wrap("light_green", a.name);
						ircSay += irc.colors.wrap("light_gray", "]: ");
						ircSay += irc.colors.wrap("yellow", a.content);
						ircSay += irc.colors.wrap("light_gray", " ["+id+"]");
						ircBot.say(ircChannel, ircSay);
					}
					catch(err) {
						ircBot.say(ircChannel, err.message);
						console.log("ircBot.say failed: "+err.message);
					}
				} else {
					console.log("Ignored: "+a.name+" : "+a.content);
				}
				break;

			case "broadcast:start":
				// NOTE: I don't think this is needed, keeping commented out in case it is.
					//if (broadcastStart === false) {
						//broadcastStart = true;
				ircBot.say(ircChannel, "STREAM IS LIVE: http://mixlr.com/jeff-gerstmann/chat/");
				break;

			case "comment:hearted":
				var a = JSON.parse(unescape(m.data));
				// TODO make this pretty, show original comment and translate user_ids into names.
				var ircSay = "HEART ADDED! comment_id: "+ a.comment_id+" user_ids: "+a.user_ids;
				ircBot.say(ircChannel, ircSay);
				break;
		}
	});

	ws.on('close', function() {
		console.log("WebSocket Closed");
	});
}

// Starts up the IRC bot according to above config;
ircInitBot();

// Opens a websocket connection, given the params below;
openSock(channelId);
