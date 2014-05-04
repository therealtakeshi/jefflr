http = require 'http'
express = require 'express'
coffeecup = require 'coffeecup'

app = express()
app.set('view engine', 'coffee')
app.engine 'coffee', require('coffeecup').__express

url = "http://mixlr.com/jeff-gerstmann/showreel/"

getShowreel = (url, callback) ->
	http.get "http://mixlr.com/jeff-gerstmann/showreel/", (res) ->
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
			callback { broadcasts, broadcasterData }

app.get '/', (req, res) ->
		getShowreel url, (broadcasts, broadcasterData) ->
			res.render 'index', broadcasts, broadcasterData

app.listen 3000

console.log "Listening on 3000..."
