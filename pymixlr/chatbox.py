#!/usr/bin/env python3

##
## Mixlr ChatBox (IRC)
##
## Version: idunnolol?
## Dependency: https://pypi.python.org/pypi/irc
##
## Description: this is poorly commented and written. I don't know what I'm doing, lol?
## Original Author: Bob Barker
##
## PS. this is really dumb, like multiple layers of abstraction dumb.
##

from mixlr import broadcast
from time import sleep
import irc.bot

class ircBot(irc.bot.SingleServerIRCBot):
	def checkMixlrComments(self):
		for comment in self.mixlr.updateUserData():
			print ('\n===newComment===\n', comment)
			self.connection.privmsg(self.channel, ('['+comment['name']+']: ' + comment['content']))
			sleep(0.1)
	
	def __init__(self, channel, nickname, server, port=6667):
	
		## [TEMPORARY]
		## WARNING: Do not share token, userLogin or session. They can be used to hijack your Mixlr user.
		## Add your authenticity_token (HTTP POST Data) [Optional?]
		token = ''
		## Add your mixlr_user_login (Cookie) [Optional?]
		userLogin = ''
		## Add your mixlr_session (Cookie) [Required for sendFunctions]
		session = ''
		broadcasterName = 'jeff-gerstmann'
		
		self.mixlr = broadcast(broadcasterName, session, userLogin, token)
		irc.bot.SingleServerIRCBot.__init__(self, [(server, port)], nickname, nickname)
		self.channel = channel
		self.connection.execute_every(2, self.checkMixlrComments)

	def on_nicknameinuse(self, c, e):
		c.nick(c.get_nickname() + "_")

	def on_welcome(self, c, e):
		c.join(self.channel)

## Some example code that might be useful later
#	def on_privmsg(self, c, e):
#		self.do_command(e, e.arguments[0])

#	def on_pubmsg(self, c, e):
#		a = e.arguments[0].split(":", 1)
#		if len(a) > 1 and irc.strings.lower(a[0]) == irc.strings.lower(self.connection.get_nickname()):
#			self.do_command(e, a[1].strip())
#		return

	# def do_command(self, e, cmd):
		# nick = e.source.nick
		# c = self.connection

		# if cmd == "disconnect":
			# self.disconnect()
		# elif cmd == "die":
			# self.die()
		# elif cmd == "stats":
			# for chname, chobj in self.channels.items():
				# c.notice(nick, "--- Channel statistics ---")
				# c.notice(nick, "Channel: " + chname)
				# users = chobj.users()
				# users.sort()
				# c.notice(nick, "Users: " + ", ".join(users))
				# opers = chobj.opers()
				# opers.sort()
				# c.notice(nick, "Opers: " + ", ".join(opers))
				# voiced = chobj.voiced()
				# voiced.sort()
				# c.notice(nick, "Voiced: " + ", ".join(voiced))
		# elif cmd == "dcc":
			# dcc = self.dcc_listen()
			# c.ctcp("DCC", nick, "CHAT chat %s %d" % (
				# ip_quad_to_numstr(dcc.localaddress),
				# dcc.localport))
		# else:
			# c.notice(nick, "Not understood: " + cmd)
			
def main():
	import sys
	if len(sys.argv) != 4:
		print("Usage: chatbox <server[:port]> <channel> <nickname>")
		sys.exit(1)

	s = sys.argv[1].split(":", 1)
	server = s[0]
	if len(s) == 2:
		try:
			port = int(s[1])
		except ValueError:
			print("Error: Erroneous port.")
			sys.exit(1)
	else:
		port = 6667
	channel = sys.argv[2]
	nickname = sys.argv[3]

	bot = ircBot(channel, nickname, server, port)
	bot.start()

if __name__ == "__main__":
	main()
