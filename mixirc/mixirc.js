// Required Modules
var http = require('http');
var fs = require('fs');
var request = require('request');
var querystring = require('querystring');
var websock = require('ws');
var irc = require('irc');

// Check cookie for user and session data, userId from API;
// Buuuuuttttt... Channel ID is Jeff;
var channelId = 27902;
var userId = 2037220;
var authUserLogin = "";
var authSession = "";
var userAgent = "Mixlr Chatbox <3";
//var firebaseDomain = '';

// Config for IRC client;
var ircConf = {
	server: "irc.freenode.org",
	name: "jefflrbot",
	opts: {
		botName: "jefflrbot",
		realName: "BEEP BOOP I AM A ROBOT",
		port: 6667,
		debug: false,
		showErrors: false,
		autoRejoin: true,
		autoConnect: true,
		channels: ['#jeffdrives'],
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
};

// Creates the IRC client with given params;
var ircBot = new irc.Client(ircConf.server, ircConf.name, ircConf.opts);

// Simple file writing function to create a file;
// NOTE: will throw an error if error exists, so not graceful;
// NOTE: not critical;
function writeIt(file, input, log) {
	fs.writeFile(file, input, function(err) {
		if (err) throw err;
		console.log(log);
	});
}

// Destringifies the nasty JSON response that mixlr likes;
// NOTE: requires and returns a JSON object;
function destringify(a) {
	var b = '_'+JSON.stringify(a).replace(/\\/g,"")+'_';
	var c = b.replace(/_"/g,"").replace(/"_/g,"");
	return JSON.parse(c);
}

// Fixes up JavaScript's encode function;
// NOTE: not critical;
function fixedEncodeURIComponent(str) {
	return encodeURIComponent(str).replace(/[!'()]/g, escape).replace(/\*/g, "%2A").replace(/%20/g, "+");
}

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
// NOTE: can pretty much be deprecated since websocket implementation
function getUserData(broadcasterName, cb) {
	request('http://api.mixlr.com/users/' + broadcasterName + '?include_comments=true', function(err, res, body) {
		comments = JSON.parse(body).live_page_comments;
		// writeIt("./Chatlog/chats.json",comments,"Chat written.");
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
}

function joinCrowd(broadcasterName, userLogin, userSession) {
	request('http://api.mixlr.com/users/' + broadcasterName + '?include_comments=true', function(err, res, body) {
		comments = JSON.parse(body).live_page_comments;
		// writeIt("./Chatlog/chats.json",comments,"Chat written.");
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
}

function isMixlr(obj) {
	return (obj.indexOf("jefflrbot:" != -1));
}

function ircInitBot(listen) {
	// Should send message when joining room, but doesn't currently work;
	// ircBot.addListener('registered', function (message) {
	//	   ircBot.say(ircConf.opts.channels[0],"I AM HERE TO ENSLAVE AND DESTROY");
	// });

	// Sets up the error listener and outputs to console;
	//ircBot.addListener('error', function(message) {
	//	  console.log('error: ', message);
	//});

	// Sets up a listener to the given channel, but not necessary;
	if (listen === true) {
		ircBot.addListener('message'+ircConf.opts.channels[0], function (from, message) {
			if (from !== 'jefflrbot') {
				console.log(from + ' => '+ircConf.opts.channels[0]+': ' + message);
			}
			if (message.toLowerCase() === "sup "+ircBot.name || message.toLowerCase() === 'sup jefflrbot?') {
				ircBot.say(ircConf.opts.channels[0], "OH YOU KNOW JUST ENSLAVING THE HUMAN RACE");
			}
			if (message.toLowerCase() === 'bye jefflrbot' && from === 'BobBarker') {
				ircBot.disconnect(setTimeout(process.exit(code=0),1000));
			}
			if (isMixlr(message) && from !== 'jefflrbot') {
				var cleaned = message.replace(/\(M\)/,"");
				var object = cleaned.split("|",2);
				var username = object[0];
				var comment = cleaned;
				// console.log(username+": "+comment);
				if (from === 'User1') {
					postComm(comment,channelId,"UserAuthLogin", "SessionID");
				}
				else if (from === 'User2') {
					postComm(comment,channelId,"UserAuthLogin", "SessionID");
				}
				else {
//					ircBot.say(ircConf.opts.channels[0], "FAILED AUTHENTICATION PLEASE GIVE MY HUMAN HANDLER YOUR CREDENTIALS");
				}
			}
		});
	}
}

// Brilliant POST function (i.e. IT WORKS!);
//
// TODO: set up listener from IRCbot;
function postComm(comment, channelId, authUserLogin, authSession) {
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
		var data = querystring.encode(comm);

	// An object of options to indicate where to post to
		var post_options = {
		hostname: 'mixlr.com',
		path: '/comments',
		method: 'POST',
		headers: {
			"X-Requested-With": "XMLHttpRequest",
			"User-Agent": userAgent,
			"Content-type": "application/x-www-form-urlencoded",
			"Accept": 'text/plain',
			"Cookie": 'mixlr_user_login=' + authUserLogin + '; mixlr_session=' + authSession
		}
	};

	// Set up the request
	var post_req = http.request(post_options, function(res) {
		res.setEncoding('UTF-8');
		// res.on('data', function(chunk) {
		//	   console.log('Response: ' + chunk);
		// });
	});

	// post the data
	post_req.write(data);
	post_req.end();
}

// Opens a websocket connection and receives data as long as the connection remains open;
// NOTE: you'll receive an error of Invalid Signature, but it will still receive data;
//
// TODO: add in the ping function (seems to be every 5 minutes);
// TODO: figure out how to programmatically add in the auth value;
function openSock(channelId,userId) {
	// Starts up the IRC bot according to above config;
	//ircInitBot(true);
	var shake1 = JSON.stringify({
		"event":"pusher:subscribe",
		"data":{
			"channel":"production;public"
		}
	}),
	shake2 = JSON.stringify({
		"event":"pusher:subscribe",
		"data":{
			"channel":"production;user;"+channelId
		}
	}),
	shake3 = JSON.stringify({
		"event":"pusher:subscribe",
		"data":{
			"channel":"production;user;"+userId
		}
	}),
	// Here's the important part. Without this, it doesn't work;
	// I've shaved off a LOT of the extra data, but this works enough to receive data;
	// NOTE: the channel_data part needs to be stringified;
	// NOTE: can get auth from hitting /v2/users
	clientData = JSON.stringify({
		"event":"pusher:subscribe",
		"data":{
			"channel":"presence-production;crowd;"+channelId+"",
			"auth":"",
			"channel_data":"{\"user_id\":\""+userId+"\",\"user_info\":{\"id\":\""+userId+"\",\"user\":{\"id\":\""+userId+"\"}}}"
		}
	}),

	broadcastStart = false;

	var ws = new websock('ws://ws.pusherapp.com/app/2c4e9e540854144b54a9?protocol=5&client=js&version=1.12.7&flash=false');
	ws.on('open', function() {
		console.log("Connected.");
		ws.send(shake1);
		ws.send(shake2);
		ws.send(shake3);
		ws.send(clientData);
	});
	ws.on('message', function(message) {
		console.log('Received: %s', message);
		var name = "uninitialized";
		var content = "uninitialized";
		try {
			m = JSON.parse(message);
		}
		catch(err) {
			console.log("JSON.parse(message) failed: "+err.message);
		}
		if (m.event === "comment:created") {
			try {
//				decodeURIComponent() will throw an exception if it finds an unencoded '%' character, unescape does not.
//				var a = JSON.parse(decodeURIComponent(m.data));
				var a = JSON.parse(unescape(m.data));
			}
			catch(err) {
				content = "JSON.parse(unescape(m.data)) failed: "+err.message;
			}
			try {
				name = a.name;
				content = a.content;
				var ircSay = irc.colors.wrap("light_gray", "[");
				ircSay += irc.colors.wrap("light_green", name);
				ircSay += irc.colors.wrap("light_gray", "]: ");
				ircSay += irc.colors.wrap("yellow", content);
				ircBot.say("#jeffdrives", ircSay);
			}
			catch(err) {
				ircBot.say("#jeffdrives", err.message);
				console.log("ircBot.say failed: "+err.message);
			}
		}
		if (m.event === "broadcast:start" && broadcastStart === false) {
			ircBot.say("#jeffdrives","BEEP BOOP JEFF IS LIVE BOOP BEEP");
			ircBot.say("#jeffdrives","LINK FOR INFERIOR HUMAN INTERNET: http://mixlr.com/jeff-gerstmann/chat/");
			broadcastStart = true;
		}
	});
	ws.on('close', function() {
		console.log('Disconnected');
	});
}
ircInitBot(true);

// Opens a socket connection, given the params below;
openSock(channelId,userId);
