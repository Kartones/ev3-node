var EV3Robot = require('./EV3Robot.js');
var robot = new EV3Robot.Robot();

// Actual code goes here
var programCommands = function(robotInstance) {
	var
		MAX_SPEED = 100,
		MIN_SPEED = -100,
		motors = {
			A : 0,
			B : 0,
			C : 0,
			D : 0
		};

		var logMotors = function() {
			console.log("A:" + motors.A + " B:" + motors.B + " C:" + motors.C + " D:" + motors.D);
		};

	console.log('Press <ENTER> to start');

	// key-by-key read
	process.stdin.setRawMode(true);
	// disallow node app from quitting unless explicit exit
	process.stdin.resume();
	process.stdin.setEncoding('utf8');

	process.stdin.on('data', function(key) {
		switch (key) {
			case 'q':
				if (motors.A < MAX_SPEED) {
					motors.A += 10;
				}
				logMotors();
				robot.moveMotors(motors.A, motors.B, motors.C, motors.D);
			break;
			case 'a':
				if (motors.A > MIN_SPEED) {
					motors.A -= 10;
				}
				logMotors();
				robot.moveMotors(motors.A, motors.B, motors.C, motors.D);
			break;
			case 'w':
				if (motors.B < MAX_SPEED) {
					motors.B += 10;
				}
				logMotors();
				robot.moveMotors(motors.A, motors.B, motors.C, motors.D);
			break;
			case 's':
				if (motors.B > MIN_SPEED) {
					motors.B -= 10;
				}
				logMotors();
				robot.moveMotors(motors.A, motors.B, motors.C, motors.D);
			break;
			case 'e':
				if (motors.C < MAX_SPEED) {
					motors.C += 10;
				}
				logMotors();
				robot.moveMotors(motors.A, motors.B, motors.C, motors.D);
			break;
			case 'd':
				if (motors.C > MIN_SPEED) {
					motors.C -= 10;
				}
				logMotors();
				robot.moveMotors(motors.A, motors.B, motors.C, motors.D);
			break;
			case 'r':
				if (motors.D < MAX_SPEED) {
					motors.D += 10;
				}
				logMotors();
				robot.moveMotors(motors.A, motors.B, motors.C, motors.D);
			break;
			case 'f':
				if (motors.D > MIN_SPEED) {
					motors.D -= 10;
				}
				logMotors();
				robot.moveMotors(motors.A, motors.B, motors.C, motors.D);
			break;
			case 't':
				robot.playTone(10, Math.floor(Math.random()*(1000-100+1)+100), 300);
			break;
			case 'g':
				robotInstance.shutdown();
				process.exit();
			break;
		}
	});
};

// Init
robot.connect(programCommands);