http = require 'http'
ck = require 'coffeekup'

url = 'http://mixlr.com/jeff-gerstmann/showreel/'

template = ->
	

getShowreel = (url, callback) ->
	showreel = http.get url, (res) ->
		res.setEncoding 'utf8'
		body = ""
		res.on 'data', (chunk) ->
			body += chunk
		res.on 'end', () ->
			startStr = body.indexOf "broadcasterData", 0
			lastStr = body.indexOf "}];", startStr
#			jsonStr = body.slice startStr+18, lastStr+3
			evalData = "var "
			evalData = body.slice startStr, lastStr+3
#			console.log evalData
			eval (evalData)
			#json = JSON.parse(jsonStr)
			#console.log json
#			console.log broadcasts
#			console.log broadcasterData
#			console.log startStr, lastStr
#			console.log body.indexOf "window.broadcasterData", 0
#			console.log body
			callback { broadcasts, broadcasterData }
#			return { broadcasts, broadcasterData }

#blah = getShowreel url, (data) 
#broadcasts = {}

getShowreel url, (_broadcasts) ->
#mixlr = showreel url, (_broadcasts) ->
#	console.log broadcasts

getShowreel url, (mixlrData) ->
	$().ready ->
		$('body').append templates.template(mixlrData.broadcasts, mixlrData.broadcasterData)
