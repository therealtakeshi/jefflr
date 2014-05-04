doctype 5
html ->
	head ->
		meta charset: 'utf-8'
		title "Jeffreel | #{@broadcasterData.username}"

	body ->
		for broadcast in @broadcasts
			div id: 'broadcast', ->
				div id: 'title', -> a href: broadcast.streams.http.url, -> broadcast.title
				div id: 'date', -> p "Started: "+broadcast.started_at
				div id: 'duration', -> p "Duration: "+broadcast.duration
