#!/usr/bin/env python3

##
## Mixlr Python API Wrapper
##
## Version: idunnolol?
## Dependency: FFmpeg 1.1 or greater (libav won't work, concatAudio requires the concat demuxer feature)
##
## Description: this is poorly commented and written. I don't know what I'm doing, lol?
## Original Author: Bob Barker
##
## PS. this is really dumb, like multiple layers of abstraction dumb.
##

## General TODO: Add exception handling, command line argument support.

import subprocess
import json
import os
import shutil
from datetime import datetime
from urllib import request, parse

class broadcast:
	def __init__(self, broadcasterName, session='', userLogin='', token='', enableRecord=False, forceStreamType=False, useIOSStream=True, useRegularStream=True, userAgent='Mixlr Chatbox <3', debug=False, encoder='utf-8', moveEnabled=True, moveDestination='archive/'):
		self.broadcasterName = broadcasterName

		self.session = session
		self.userLogin = userLogin
		self.token = token
		self.enableRecord = enableRecord
		self.forceStreamType = forceStreamType
		self.useIOSStream = useIOSStream
		self.useRegularStream = useRegularStream
		self.userAgent = userAgent
		self.debug = debug
		self.encoder = encoder
		self.moveEnabled = moveEnabled
		self.moveDestination = moveDestination
		
		self.userData = {}
		self.comments = []
		self.updateUserData()
		
		self.broadcasterID = self.getID()
		
	def getUserData(self, getComments):
		try:
			return json.loads((request.urlopen('http://api.mixlr.com/users/'+self.broadcasterName+('?include_comments=true' if getComments is True else '')).read()).decode(self.encoder))
		except:
			return False
	
	def updateUserData(self, getComments=True):
		newUserData = self.getUserData(getComments)
		if newUserData is False:
			return False
		if getComments is True:
			newComments = [x for x in newUserData['live_page_comments'] if x not in self.comments]
			newComments = sorted(newComments, key=lambda k: k['timestamp'])
			for comment in newComments:
				self.comments.append(comment)
			self.comments = sorted(self.comments, key=lambda k: k['timestamp'], reverse=True)
			del newUserData['live_page_comments']
		else:
			newComments = [{"id":'',"content":"getComments was not True","safe_content":'',"name":'',"image_url":'',"user_id":'',"created_at":'',"timestamp":'',"hearted_user_ids":[],"broadcast_id":'',"broadcast_title":''}]
		
		## For Testing concatAudio(), if this is uncommented I probably fucked up my commit.
		#self.userData['is_live'] = True
		#self.userData['broadcast_ids'] = ['c0deb69b8c3db900b788e2101bc9e48e']
		
		if self.getIsLive() is True and newUserData['is_live'] is False:
			if self.debug is True:
				print ('concatAudio()')
			self.concatAudio()
		self.userData.update(newUserData)
		if (self.debug is True):
			print ('\n===userData===\n', self.userData)	
		if self.enableRecord and self.getIsLive() is True:
			self.recordAudio()
		return newComments
	
	def getUserName(self):
		return self.userData['username']
	
	def getID(self):
		return self.userData['id']
	
	def getProfileImage(self):
		return self.userData['profile_image_url']
	
	def getAboutMe(self):
		return self.userData['about_me']
	
	def getIsLive(self):
		try:
			return self.userData['is_live']
		except:
			return False
	
	def getBroadcastID(self):
		if self.getIsLive() is True:
			## TODO: Figure out if broadcast_ids ever contains more than one element.
			return self.userData['broadcast_ids'][0]
		else:
			return 'ERROR: '+self.getUserName+' is not broadcasting'
	
	def getComments(self):
		return self.comments
	
	def setEnableRecord(self, enableRecord=True, forceStreamType=False, useIOSStream=True, useRegularStream=True):
		self.enableRecord = enableRecord
		self.forceStreamType = forceStreamType
		self.useIOSStream = useIOSStream
		self.useRegularStream = useRegularStream
	
	def sendData(self, data, url):
		headers = {
			'X-Requested-With': 'XMLHttpRequest',
			'User-Agent': self.userAgent,
			'Content-type': 'application/x-www-form-urlencoded',
			'Accept': 'text/plain',
			'Cookie': 'mixlr_user_login='+self.userLogin+'; mixlr_session='+self.session
			}
		if (self.debug is True):
			print ('\n===HTTP Request Header===\n', headers)
		if (self.debug is True):
			print ('\n===HTTP Request Data===\n', data)
		req = request.Request(url, (parse.urlencode(data)).encode(self.encoder), headers)
		try:
			return (request.urlopen(req)).read()
		except:
			return False
	
	def sendMessage(self, newComment):
		data = {
			'comment[content]':newComment,
			'comment[broadcaster_id]':self.broadcasterID,
			## Optional? I'm not really sure what most of this stuff does.
			#'comment[exclude_socket_id]':'',
			#'comment[broadcaster_not_in_room]':'1',
			#'comment[explicitly_shared]':'0',
			#'comment[do_not_publish]':'1',
			#'authenticity_token':self.token
			}
		return self.sendData(data, 'http://mixlr.com/comments')
	
	## NOTE: Mixlr will throttle you if you start sending hearts faster than 1/second. [WARNING: HEART INFLATION IS REAL]
	## TODO: Figure out if broadcastUID is static per user or generated on each broadcast. Make it a class variable.
	def sendHeart(self, broadcastUID):
		data = {
			'type':'heart',
			'broadcast_uid':broadcastUID,
			## Optional? I'm not really sure what most of this stuff does.
			#'socket_id':'',
			#'do_not_publish':'1',
			#'authenticity_token':self.token
			}
		return self.sendData(data, 'http://mixlr.com/broadcast_actions')
	
	def sendCommentHeart(self, commentID):
		data = {
			#'socket_id':'',
			#'authenticity_token':self.token
			}
		return self.sendData(data, 'http://mixlr.com/comments/'+commentID+'/heart')
	
	## TODO: implement this
	def sendDeleteCommentHeart(self, commentID):
		pass
		#sendData(userLogin, session, data, ('http://mixlr.com/comments/'+commentID+'/heart'))
		#curl "http://mixlr.com/comments/58444856/heart" -X DELETE -H "Cookie: mixlr_user_login=REDACTED; mixlr_session=REDACTED" -H "Origin: http://mixlr.com" -H "Accept-Encoding: gzip,deflate,sdch" -H "Accept-Language: en-US,en;q=0.8" -H "User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.11 Safari/537.36" -H "Content-Type: application/x-www-form-urlencoded" -H "Accept: application/json, text/javascript, */*; q=0.01" -H "Referer: http://mixlr.com/jeff-gerstmann/chat/" -H "X-Requested-With: XMLHttpRequest" -H "Connection: keep-alive" -H "DNT: 1" --data "socket_id=REDACTED&authenticity_token=REDACTED" --compressed
	
	def concatAudio(self):
		## TODO: Make streamType an object or something, this whole for loop is ugly.
		for streamType in ['ios.m4a', 'reg.m4a', 'reg.mp3']:
			filesToConcat = []
			for file in (os.listdir('.')):
				if all(x in file for x in [self.getBroadcastID(), streamType]):
					if 'concat-' not in file:
						if (os.stat(file)).st_size > 1024:
							filesToConcat.append(file)
			if len(filesToConcat) > 0:
				filesToConcat = sorted(filesToConcat)
				if self.debug is True:
					print('===Sorted filesToConcat===\n', filesToConcat)
				try:
					concatList = os.open('concat.tmp', os.O_RDWR|os.O_CREAT|os.O_TRUNC)
				except:
					print ('concatAudio fail to create concat.tmp')
				for file in filesToConcat:
					entry = 'file \''+str(file)+'\'\n'
					test = os.write(concatList, entry.encode(self.encoder))
				os.close(concatList)
				try:
					ffmpeg = subprocess.call(['ffmpeg', '-f', 'concat', '-i', 'concat.tmp', '-codec', 'copy', '-n', 'concat-'+filesToConcat[0]])
					ffmpegCompleted = True
				except:
					ffmpegCompleted = False
					print ('concatAudio failed to concatenate with ffmpeg')
				if self.moveEnabled and ffmpegCompleted is True:
					try:
						shutil.move('concat-'+filesToConcat[0], self.moveDestination+filesToConcat[0])
						## Hacky sudomv shell call replaced with shutil.move
						#sudomv = subprocess.call(['sudo', 'mv', 'concat-'+filesToConcat[0], self.moveDestination+filesToConcat[0]])
					except:
						print ('concatAudio failed to mv')
			else:
				if self.debug is True:
					print ('Could not find any files containing \''+self.getBroadcastID()+'\' and \''+streamType+'\'')

	
	def recordAudio(self):
		if self.getIsLive() is True:
			command = ['ffmpeg', '-n', '-i', 'rtsp://edge02.mixlr.com:554/ios/production/'+self.getBroadcastID(), '-acodec', 'copy', self.broadcasterName+'-'+datetime.now().strftime('%Y%m%d-%H%M%S')+'-'+self.getBroadcastID()+'-ios.m4a']
			if self.forceStreamType is True and self.useIOSStream is False:
				pass
			else:
				if self.debug is True:
					print ('\n\n=====Trying IOS Stream [m4a]=====\n', command, '\n')
				try:
					ffmpeg = subprocess.call(command)
				except:
					print ('=====ERROR: recordAudio for IOS Stream [m4a] failed.=====\n')
			
			if self.forceStreamType is True and self.useRegularStream is False:
				pass
			else:
				command[3] = 'rtsp://edge01.mixlr.com:554/live/production/'+self.getBroadcastID()
				command[6] = self.broadcasterName+'-'+datetime.now().strftime('%Y%m%d-%H%M%S')+'-'+self.getBroadcastID()+'-reg.m4a'
				if self.debug is True:
					print ('\n\n=====Trying Regular Stream [m4a]=====\n', command, '\n')
				try:
					ffmpeg = subprocess.call(command)
				except: 
					print ('=====ERROR: recordAudio for Regular Stream [m4a] failed.=====\n')
				
				command[6] = self.broadcasterName+'-'+datetime.now().strftime('%Y%m%d-%H%M%S')+'-'+self.getBroadcastID()+'-reg.mp3'
				if self.debug is True:
					print ('\n\n=====Trying Regular Stream [mp3]=====\n', command, '\n')
				try:
					process = subprocess.call(command)
				except:
					print ('=====ERROR: recordAudio for Regular Stream [mp3] failed.=====\n')
		else:
			print ('\nERROR: '+self.getUserName()+' is not broadcasting\n')

#def main():
#	pass

#if __name__ == '__main__':
#	main()
