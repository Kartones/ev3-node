ev3-node
=====

Current version: 0.0.1

# Intro #

This aims to be a small Node.js library to connect and control the Lego Mindstorms EV3 via Bluetooth.
There will probably appear other librarys more complex, complete and powerful but this started as a personal challenge
for a weekend event (2013's #Freakend) and I just wanted to do some lower-level coding in something different than C#.

Anybody can freely download EV3 Linux OS sources from https://github.com/mindboards/ev3sources

# Roadmap #

So big I won't bother yet detailing. Code is still unorganized, most methods are public and should be moved to vars,
missing comments, needing also splitting into more subfiles to better organize it, and in general I need to learn properly
the EV3 OS source files to properly design the library instead of based in half a dozen commands as it is now :)
And of course wrapping this into a npm module or similar.

# Usage #

I encourage you to check the `sample_program.js` file, as it is quite simple, but this are the (few) commands you can
currently send to the EV3 brick/robot:
* `connect(callback)`: Connects and runs a program; just set as the param the function with the actual "program commends" you want the robot to run.
* `shutdown()`: Stops executing the program and disconnects.
* `playTone(volume, frequency, duration)`: Plays a tone with given volume (BYTE), frequency (UINT) and duration (SHORT).
* `moveMotors(motorA, motorB, motorC, motorD)`: Moves all motors. Each one is a [-100,100] BYTE; sign indicates direction of motor rotation.

# Dependencies #

* `bluetooth-serial-port`: https://github.com/eelcocramer/node-bluetooth-serial-port . Probably others will work but that's
 the one I was able to compile under Windows for Node, so it's the one I'm using.
