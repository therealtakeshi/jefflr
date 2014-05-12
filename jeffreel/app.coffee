http = require 'http'
express = require 'express'
coffeecup = require 'coffeecup'
cheerio = require 'cheerio'
moment = require 'moment'

app = express()
app.set 'view engine', 'coffee'
app.engine 'coffee', require('coffeecup').__express

user = 'jeff-gerstmann'
port = 3000

getShowreel = (user, page, callback) ->
	req = http.get "http://mixlr.com/#{user}/showreel/?page=#{page}", (res) ->
		data = ''
		res.setEncoding('utf8')
		res.on 'data', (chunk) ->
			data += chunk
		res.on 'end', () ->
			$ = cheerio.load data
			ctext = $('section#main_content > script').text()
			[caster, streams] = (ctext.split /\n/).slice 2, 4
			# Kludgy, but much better than eval-ing untrusted JS on Bob's/Tak's server.
			return unless (/broadcasterData = /.test caster) and
				(/var broadcasts = /.test streams)
			[broadcasterData, broadcasts] =
				JSON.parse s.slice (s.indexOf ' = ') + 3, -1 for s in [caster, streams]
			pad = '00'
			for b in broadcasts
				b.started_at_local = moment.utc(b.started_at).toDate().toString()
				dur = moment.duration(b.duration, 'seconds')
				b.runningtime = ((pad+num).slice(-pad.length) for num in [dur.hours(), dur.minutes(), dur.seconds()]).join ":"
			callback { broadcasts, broadcasterData }
	req.end()

app.get '/', (req, res) ->
	page = 1
	if isFinite req.query.page
		page = req.query.page
	getShowreel user, page, (broadcasts, broadcasterData) ->
		res.render 'index', broadcasts, broadcasterData

app.listen port
console.log "Listening on #{port}."
