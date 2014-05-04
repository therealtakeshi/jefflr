ul ->
	for broadcast in @broadcasts
		li -> a href: broadcast.streams.http.url, -> broadcast.title
