# Required Modules
http = require('http')
fs = require('fs')
request = require('request')
querystring = require('querystring')
websock = require('ws')
irc = require('irc')

# General bot configuration
ircNick = "devvlrbot"
ircChannel = "#jeffdevs"
ircServer = "irc.freenode.org"
channelId = 27902
userAgent = "mixirc <3"

userList = {}
ignoreList = []
ircBot = {}

useFirebase = true

ircMessage = (from, to, message) ->
	console.log "#{from} => #{to}: #{message}"
	return if from is ircBot.nick  # abort if talking to self
	info = userList[from]
	return unless info?  # abort if this is a nobody
	heartMatch = /^\.([0-9]+)$/.exec message
	mixMsgMatch = /^\[\[ (.+)$/.exec message
	mixHrtMatch = /^\]\] ([0-9]+)$/.exec message
	switch
		when message.toLowerCase() is "sup " + ircBot.nick
			ircBot.say to, "OH YOU KNOW JUST ENSLAVING THE HUMAN RACE"
		when info.canHeart and heartMatch?
			console.log "IRC => postAddCommentHeart: ", from, heartMatch[1],
				message, channelId, info.mixlrUserLogin, info.mixlrAuthSession
			postAddCommentHeart heartMatch[1], info, userAgent
		when info.canHeart and mixHrtMatch?
			console.log "IRC => xhrCommAddHeart #{mixHrtMatch[1]}, #{info}"
			xhrCommAddHeart mixHrtMatch[1], info
		when mixMsgMatch?
			xhrComm mixMsgMatch[1], channelId, info
		else
			console.log "IRC => postComm: ", from, message, channelId,
				info.mixlrUserLogin, info.mixlrAuthSession
			postComm message, channelId, info, userAgent

# Creates the IRC client with given params
ircInitBot = () ->
	ircBot = new irc.Client ircServer, ircNick,
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

	ircBot.addListener 'message', ircMessage

postMix = (user, url, data) ->
	jar = request.jar()
	c = request.cookie "mixlr_user_login=#{user.mixlrUserLogin}" +
		"; mixlr_session=#{user.mixlrAuthSession}"
	console.log "postMix: c: #{c}"
	jar.setCookie c, url
	form = {}
	form[k] = v for k, v of data
	req = request {
		method: 'POST'
		uri: url
		jar: jar
		form: form
	}, (e, resp, body) ->
		return console.log "postMix: POST failed" if e
		if resp.statusCode == 200
			info = JSON.parse body
			console.log "postMix: #{k}: #{v}" for k, v of info
		else
			console.log "postMix: server returned #{resp.statusCode}"

xhrComm = (comment, channelId, user) ->
	postMix user, 'http://mixlr.com/comments',
		"comment[content]": comment
		"comment[broadcaster_id]": channelId

xhrCommAddHeart = (commentId, user) ->
	postMix user, "http://mixlr.com/comments/#{commentId}/heart"

sendHTTP = (httpHeader, data) ->
	httpReq = http.request httpHeader, (res) ->
		res.setEncoding('UTF-8')
	# Send HTTP POST
	httpReq.write data
	httpReq.end()

# Forms HTTP headers and data for IRC => Mixlr comment relay, sends to sendHTTP.
postComm = (comment, channelId, user) ->
	data = querystring.encode
		"comment[content]": comment,
		"comment[broadcaster_id]": channelId,
	# An object of options to indicate where to post to
	httpHeader =
		hostname: 'mixlr.com'
		path: '/comments'
		method: 'POST'
		headers:
			"X-Requested-With": "XMLHttpRequest"
			"User-Agent": userAgent
			"Content-type": "application/x-www-form-urlencoded"
			"Accept": 'text/plain'
			"Cookie": 'mixlr_user_login=' + user.mixlrUserLogin +
				'; mixlr_session=' + user.mixlrAuthSession
	console.log "postComm => Mixlr: ", comment, httpHeader, data,
		user.mixlrUserLogin, user.mixlrAuthSession
	# Send HTTP POST
	sendHTTP httpHeader, data

# Forms HTTP headers and data for IRC => Mixlr comment hearting, sends to sendHTTP.
postAddCommentHeart = (commentId, user) ->
	console.log "postAddCommentHeart =>", commentId, user
	httpHeader =
		hostname: "mixlr.com"
		path: "/comments/"+commentId+"/heart"
		method: "POST"
		headers:
			"X-Requested-With": "XMLHttpRequest"
			"User-Agent": userAgent
			"Content-Type": "application/x-www-form-urlencoded"
			"Accept": "text/plain"
			"Cookie": "mixlr_user_login=" + user.mixlrUserLogin +
				"; mixlr_session=" + user.mixlrAuthSession
	console.log httpHeader
	# Send HTTP POST
	sendHTTP httpHeader, ""

ircWrapMessage = (a) ->
	ircSay = irc.colors.wrap "light_gray", "["
	ircSay += irc.colors.wrap "light_green", a.name
	ircSay += irc.colors.wrap "light_gray", "]: "
	ircSay += irc.colors.wrap "yellow", a.content
	ircSay += irc.colors.wrap "light_gray", " [#{a.id}]"
	return ircSay

ircWrapHeart = (a) ->
	ircSay = irc.colors.wrap "light_magenta", "<3 "
	ircSay += irc.colors.wrap "light_blue", a.user_ids + " "
	ircSay += irc.colors.wrap "light_red", a.comment_id
	return ircSay

# Opens a websocket connection and receives data as long as the connection remains open
# TODO: add in the ping function (seems to be every 5 minutes)
openSock = () ->
	broadcastStart = false
	channelSocket = JSON.stringify
		"event":
			"pusher:subscribe"
		"data":
			"channel":
				"production;user;#{channelId}"
	
	ws = new websock 'ws://ws.pusherapp.com/app/2c4e9e540854144b54a9?protocol=5&client=js&version=1.12.7&flash=false'

	ws.on 'open', ->
		console.log "Connected."
		ws.send channelSocket

	ws.on 'message', (message) ->
		console.log 'Received: %s', message
		try
			m = JSON.parse message
		catch err
			console.log "JSON.parse(message) failed: #{err.message}"
		switch m.event
			when "comment:created"
				try
					# NOTE: decodeURIComponent() will throw an exception if it finds
					# an unencoded '%' character, unescape does not.
					#a = JSON.parse(decodeURIComponent(m.data))
					a = JSON.parse unescape m.data
				catch err
					console.log "JSON.parse(unescape(m.data)) failed: #{err.message}"
				unless ignoreList[a.name]?
					try
						ircBot.say ircChannel, ircWrapMessage a
					catch err
						ircBot.say ircChannel, err.message
						console.log "ircBot.say failed: #{err.message}"
				else
					console.log "Ignored: #{a.name} : #{a.content}"

			when "broadcast:start"
				if broadcastStart is false
					broadcastStart = true
					ircBot.say ircChannel, "STREAM IS LIVE: http://mixlr.com/jeff-gerstmann/chat/"

			when "comment:hearted"
				a = JSON.parse unescape m.data
				# TODO make this pretty, show original comment and translate
				# user_ids into names.
				ircBot.say ircChannel, ircWrapHeart a

	ws.on 'close', ->
		console.log "WebSocket Closed"

startBot = () ->
	# Starts up the IRC bot according to above config
	ircInitBot()
	# Opens a websocket connection, given the params below
	openSock()

firebase = require('firebase')
auth = require('./auth.json')
db = new firebase(auth.domain)
db.auth auth.token, (error) ->
	if error
		console.log "[FAIL] Firebase Authentication: ", error
	else
		console.log "[PASS] Firebase Authenticated"
dataRef = new firebase(auth.domain)
dataRef.on 'value', (snapshot) ->
	data = snapshot.val()
	ircNick = data.config.ircNick
	ircChannel = data.config.ircChannel
	if 'dev' in process.argv
		ircNick = 'devvlrbot'
		ircChannel = '#JeffDevs'
	ircServer = data.config.ircServer
	channelId = data.config.channelId
	userAgent = data.config.userAgent
	userList = data.users
	ignoreList = data.ignoreList
	startBot()

# vim: set noet ts=4:
