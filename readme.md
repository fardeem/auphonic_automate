# Auphonic Automation

[The Munir and Munir Show](http://www.show.munirhasan.com/), a podcast I host with my dad, uses Auphonic to do post-processing of the audiofiles for better sound quality, meta data, noise reduction, etc. Uploading with their website is fairly easy and straighforward but when I found out they had an API, I couldn't resist the urge to automate everything I used to do by hand. Lolol.

It works as follows:
1. Finds a suitable account with enough credit
2. Uploads the file
3. Opens the status page to register for getting a notification once the processing is done.

The node process takes two arguments
1. `-f` for the file
2. `-n` for the name of the episode

It also has a `-h` which prints out ways to use the thing.
 