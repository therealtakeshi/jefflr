#!/usr/bin/env python3

##
## Mixlr Python API Debug Menu
##
## Version: idunnolol?
##
## Description: If you thought the wrapper was bad this is absolute garbage, it's quickly hacked together junk to let me debug the wrapper.
## Original Author: Bob Barker
##
## PS. this is really dumb, like multiple layers of abstraction dumb.
##

from mixlr import broadcast
from time import sleep
import sys

def debugMenu():
	## WARNING: Do not share token, userLogin or session. They can be used to hijack your Mixlr user.
	## Add your authenticity_token (HTTP POST Data) [Optional?]
	token = ''
	## Add your mixlr_user_login (Cookie) [Optional?]
	userLogin = ''
	## Add your mixlr_session (Cookie) [Required for sendData]
	session = ''
	broadcasterName = 'jeff-gerstmann'
	
	while (True):
		print ('\n===DEBUG MENU===\n1. Create userData [RUN FIRST]\n2. Update userData\n3. getComments\n4. sendMessage\n5. sendCommentHeart\n6. sendHeart\n7. Watch for broadcast and record [ffmpeg required]\n0. Exit')
		debugMenuInput = input('INPUT: ')
		if (debugMenuInput == '1'):
			_broadcasterName = input('boardcasterName (return for default) ['+broadcasterName+']:')
			if _broadcasterName != '':
				broadcasterName = _broadcasterName
			_session = input('session (return for default) ['+session+']:')
			if _session != '':
				session = _session
			## Works, but has little reason to be used at the moment.
			#_userLogin = input('userLogin (return for default) ['+userLogin+']:')
			#if _userLogin != '':
			#	userLogin = _userLogin
			#_token = input('token (return for default) ['+token+']:')
			#if _token != '':
			#	token = _token
			userData = broadcast(broadcasterName, session=session, userLogin=userLogin, token=token, debug=True)
		elif (debugMenuInput == '2'):
			for newComment in userData.updateUserData():
				print ('\n===newComment===\n', newComment)
		elif (debugMenuInput == '3'):
			rawOutput = False
			if input('PARSED (return) | RAW (r): ') == 'r':
				rawOutput = True
			for comment in userData.getComments():
				if (rawOutput is True):
					print ('\n', comment)
				else:
					## TODO: Add more parsing for other values (commentID, timestamp, etc)
					print ('\n', comment['name'] + ': ' + comment['content'])
				if input('NEXT (return) | FINISH (q): ') == 'q':
					break
		elif (debugMenuInput == '4'):
			newComment = input('sendMessage(newComment): ')
			print ('\n===HTTP Response===\n', userData.sendMessage(newComment))
		elif (debugMenuInput == '5'):
			newCommentHeartID = input('sendCommentHeart(commentID): ')
			while (True):
				userData.sendCommentHeart(newCommentHeartID)
				if input('REPEAT (return) | FINISH (q): ') == 'q':
					break
		elif (debugMenuInput == '6'):
			newHeartUID = input('sendHeart(broadcastUID): ')
			if input('NORMAL (return) | LOOP (y): ') == 'y':
				loopSleepTime = 1
				_loopSleepTime = input('Check Rate (seconds) ['+str(loopSleepTime)+']: ')
				if _loopSleepTime != '':
					loopSleepTime = _loopSleepTime
				while (True):
					userData.sendHeart(newHeartUID)
					sleep(float(loopSleepTime))
			else:
				while (True):
					userData.sendHeart(newHeartUID)
					if input('REPEAT (return) | FINISH (q): ') == 'q':
						break
		elif (debugMenuInput == '7'):
			loopSleepTime = 5
			forceStreamType = False
			useIOSStream = True
			useRegularStream = True
			_loopSleepTime = input('Check Rate (seconds) ['+str(loopSleepTime)+']: ')
			if _loopSleepTime != '':
				loopSleepTime = _loopSleepTime
			if input('Force Stream Type (y/n) ['+str(forceStreamType)+']: ') == 'y':
				forceStreamType = True
				if input('Disable IOS Stream Type (y/n) ['+str(useIOSStream)+']: ') == 'y':
					useIOSStream = False
				if input('Disable Regular Stream Type (y/n) ['+str(useRegularStream)+']: ') == 'y':
					useRegularStream = False
			userData.setEnableRecord(forceStreamType=forceStreamType, useIOSStream=useIOSStream, useRegularStream=useRegularStream)
			while (True):
				userData.updateUserData(False)
				sleep(float(loopSleepTime))
		elif (debugMenuInput == '8'):
			print (userData.getBroadcastID())
		elif (debugMenuInput == '0'):
			sys.exit()
		else:
			print ('INVALID INPUT')

def main():
	## Enable for console debug menu.
	debugMenu()

if __name__ == '__main__':
    main()
