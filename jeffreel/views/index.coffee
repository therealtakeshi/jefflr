doctype 5
html ->
	head ->
		meta charset: 'utf-8'
		title "Jeffreel | #{@broadcasterData.username}"

		style '''
      body {background-color: #1E262C; font-size: 12px; font-family: Tahoma, Verdana, Arial, sans-serif}
			footer {text-align: center}
			p {color: #E0A666; margin: 0px}
			a {color: #D18026; text-decoration: none}
			h1 {font-size: 48px; text-align: center; color: #E0A666}
			#button {width: 600px; margin: 0 auto}
			#broadcast {background-color: #34414C; width: 600px; margin: 0 auto 10px auto; padding: 0 0 18px 4px}
			#title {font-size: 22px; margin-bottom: 0px}
			#date {display: inline-box; float: left}
			#duration {display: inline-box; float: right; padding: 0 4px 0 0}
			#footer {color: #E0A666}
    '''


	body ->
		h1 "Mixlr Archives"

		for broadcast in @broadcasts
			div id: 'button', -> a href: broadcast.streams.http.url, ->
				div id: 'broadcast', ->
					div id: 'title', -> broadcast.title
					div id: 'date', -> p "Started: " + broadcast.started_at
					div id: 'duration', -> p "Duration: " + broadcast.duration

		footer ->
			div id: 'footer', ->
				text "Rips are made automatically by a bot. If something is broken, contact: "
				a href: "https://twitter.com/mrbobarker", -> "@mrbobarker"
