http = require 'http'
express = require 'express'
coffeecup = require 'coffeecup'
time = require 'time'

app = express()
app.set('view engine', 'coffee')
app.engine 'coffee', require('coffeecup').__express

user = 'jeff-gerstmann'

getShowreel = (user, page, callback) ->

	showreelPath = '/'
	showreelPath += user
	showreelPath += '/showreel/?page='
	showreelPath += page.toString()

	options = {
		hostname: 'mixlr.com',
		port: 80,
		path: showreelPath,
		method: 'GET'
	}

	req = http.request options, (res) ->
		data = ''
		res.setEncoding('utf8')
		res.on 'data', (chunk) ->
			data += chunk
		res.on 'end', () ->
			startStr = data.indexOf "broadcasterData", 0
			lastStr = data.indexOf "}];", startStr
			evalData = "var "
			evalData += data.slice startStr, lastStr+3
			eval (evalData)

			for broadcast in broadcasts
				newTime = new time.Date(broadcast.started_at.substring(0, 4), broadcast.started_at.substring(5, 7), broadcast.started_at.substring(8, 10), broadcast.started_at.substring(11, 13), broadcast.started_at.substring(14, 16), broadcast.started_at.substring(17, 19), 0, 'UTC')
				newTime.setTimezone('US/Pacific')
				broadcast.started_at = newTime.toString()

				broadcast.duration = ('0' + (broadcast.duration / 3600).toFixed(0)).slice(-2) + ":" + ('0' + ((broadcast.duration / 60) % 60).toFixed(0)).slice(-2) + ":" + ('0' + (broadcast.duration % 60).toFixed(0)).slice(-2)

			callback { broadcasts, broadcasterData }
	req.end()

app.get '/', (req, res) ->
	page = 1

	if isFinite(req.query.page)
		page = req.query.page

	getShowreel user, page, (broadcasts, broadcasterData) ->
		res.render 'index', broadcasts, broadcasterData

app.listen 3000

console.log "Listening on 3000..."
