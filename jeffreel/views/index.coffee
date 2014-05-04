for broadcast in @broadcasts
	div id: 'broadcast', ->
		div id: 'title', -> a href: broadcast.streams.http.url, -> broadcast.title
		div id: 'date', -> p broadcast.started_at
		div id: 'duration', -> p broadcast.duration
