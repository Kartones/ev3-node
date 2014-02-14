/*
 * Entity that represents the EV3 brick/robot
 * Infinite kudos to Andrew Nesbitt (https://github.com/andrew/), as he was the source of some of the byte streams
 * (he reverse engineered) used for the initial program handshake with the EV3
 */
var EV3Robot = function(ev3Commands, ev3Enums, ev3CommandCounter, bluetoothConnection) {
	var
    self = this
    emptyFunction = function() {};

  if (typeof(ev3Commands) === 'undefined') {
    this.commands = require('./EV3Command.js');
  } else {
    this.commands = ev3Commands;
  }
  if (typeof(ev3Enums) === 'undefined') {
    this.enums = new (require('./EV3Enums.js')).Enums;
  } else {
    this.enums = ev3Enums;
  }
  if (typeof(ev3CommandCounter) === 'undefined') {
    // Start at 4 the counter due to internal commands
    this.commandCounter = new (require('./EV3CommandCounter.js')).CommandCounter(0);
  } else {
    this.commandCounter = ev3CommandCounter;
  }
  if (typeof(bluetoothConnection) === 'undefined') {
    // https://github.com/eelcocramer/node-bluetooth-serial-port
    this.btConnection = new (require('bluetooth-serial-port')).BluetoothSerialPort();
  } else {
    this.btConnection = bluetoothConnection;
  }


  // "Public methods"


	/*
   * Command
	 * @param BYTE volume
	 * @param UINT frequency
	 * @param SHORT duration
	 */
	this.playTone = function(volume, frequency, duration) {
		var
      outputValue,
      command = new self.commands.Command(
        self.enums.CommandTypes.DIRECT_COMMAND_NO_REPLY,
        self.enums.EV3Commands.PLAY_TONE,
        self.enums
      );

		command
        .addNumericParameter(self.enums.Parameters.BYTE, volume)
				.addNumericParameter(self.enums.Parameters.UINT, frequency)
				.addNumericParameter(self.enums.Parameters.SHORT, duration);

    outputValue = command.getHexOutput(self.commandCounter.getNext());
    self.btConnection.write(outputValue, emptyFunction);
	};


  /*
   * Command: Move all 4 motors (BYTE)
   */
  this.moveMotors = function(motorA, motorB, motorC, motorD) {
    var
      outputValue,
      command = new self.commands.Command(
          self.enums.CommandTypes.DIRECT_COMMAND_REPLY,
          self.enums.EV3Commands.MOVE_MULTI_MOTOR,
          self.enums
        );

    // Containins speed for all motors ([1..4] mean motor [A..D] index)
    command
        .addOutputDelimiter(self.enums.Delimiters.OUTPUT)
        .addNumericParameter(self.enums.Parameters.BYTE, motorA)
        .addOutputDelimiter(self.enums.Delimiters.OUTPUT_BODY)
        .addNumericParameter(self.enums.Parameters.UINT, 1)
        .addNumericParameter(self.enums.Parameters.UINT, 1)
        .addBytesString('40')

        .addOutputDelimiter(self.enums.Delimiters.OUTPUT)
        .addNumericParameter(self.enums.Parameters.BYTE, motorB)
        .addOutputDelimiter(self.enums.Delimiters.OUTPUT_BODY)
        .addNumericParameter(self.enums.Parameters.UINT, 2)
        .addNumericParameter(self.enums.Parameters.UINT, 2)
        .addBytesString('40')

        .addOutputDelimiter(self.enums.Delimiters.OUTPUT)
        .addNumericParameter(self.enums.Parameters.BYTE, motorC)
        .addOutputDelimiter(self.enums.Delimiters.OUTPUT_BODY)
        .addNumericParameter(self.enums.Parameters.UINT, 3)
        .addNumericParameter(self.enums.Parameters.UINT, 3)
        .addBytesString('40')

        .addOutputDelimiter(self.enums.Delimiters.OUTPUT)
        .addNumericParameter(self.enums.Parameters.BYTE, motorD)
        .addOutputDelimiter(self.enums.Delimiters.OUTPUT_BODY)
        .addNumericParameter(self.enums.Parameters.UINT, 4)
        .addNumericParameter(self.enums.Parameters.UINT, 4)
        .addBytesString('40');

      outputValue = command.getHexOutput(self.commandCounter.getNext());
      self.btConnection.write(outputValue, emptyFunction);
  };


	this.connect = function(programCommandsFunction) {
    var sendStartProgramCommand = function(commandsFunction) {
      var runProgramFunction = function(err) {
        if (!err) {
          programCommandsFunction(self);
        }
      };

      self._programStart(runProgramFunction);
    };

		// .connect() needs address from enclosing closure as doesn't sends it as param
		var connectionFoundFunction = function(address, name) {
        self.btConnection.findSerialPortChannel(address, function(channel) {
            self.btConnection.connect(address, channel, function() {
              console.log('> Connected to ' + name + ' (' + address + ') channel ' + channel);
              self._sendInitializationSequence(function() {
                sendStartProgramCommand(programCommandsFunction);
              });
            }, function () {
                console.log('> Cannot connect');
            });
        });
    };

    self.btConnection.on('found', connectionFoundFunction);
    self.btConnection.inquire();
	};


	this.shutdown = function(callback) {
		var closeConnectionFunction = function(err) {
		  if(callback != null) {
        callback(err);
      }
		  self.btConnection.close();
		};

    self._programStop(closeConnectionFunction);
	};


  // "Private" methods


	this._sendInitializationSequence = function(callback) {
		var loadProgramFunction = function(err) {
      if (!err) {
      	self._loadProgram(callback);
      }
    };

    self._currentProgramStop(loadProgramFunction);
	};


	this._loadProgram = function(callback) {
		var finishDownloadFunction = function(err) {
	    if(!err && callback != null) {
        callback();
      }
  	};

		var sendProgramFunction = function(err) {
      if (!err) {
        self._closeFileHandle(finishDownloadFunction);
      }
  	};

  	var initDownloadFunction = function(err) {
      if (!err) {
        self._sendProgramData(sendProgramFunction);
      }
    };

    self._beginProgramDownload(initDownloadFunction);
	};


  /*
   * Command: Download program to brick
   */
  this._beginProgramDownload = function(callbackFunction) {
    var
      outputValue,
      command = new self.commands.Command(
        self.enums.CommandTypes.DIRECT_COMMAND_REPLY,
        self.enums.EV3Commands.SYSTEM_BEGIN_DOWNLOAD,
        self.enums
      );

    command
      .addBytesString('0F010000')   // file length
      .addBytesString('2F6D6E742F72616D6469736B2F70726A732F6B2E72626600'); // filename (ASCII, "/mnt/ramdisk/prjs/k.rbf")

    outputValue = command.getHexOutput(self.commandCounter.getNext());
    self.btConnection.write(outputValue, callbackFunction);
  };


  /*
   * Command: Send actual program to brick?
   */
  this._sendProgramData = function(callbackFunction) {
    var
      outputValue,
      command = new self.commands.Command(
        self.enums.CommandTypes.SYSTEM_COMMAND_REPLY,
        self.enums.EV3Commands.SYSTEM_CONTINUE_DOWNLOAD,
        self.enums
      );

    command
      .addBytesString('00')  // handle to file (from BEGIN_DOWNLOAD)
                             // Payload
      .addBytesString('4C45474F0F01000065000500050000004C00000000000000080000000B01000000000000000000000C01000000000000')
      .addBytesString('000000000D01000000000000000000000E0100000000000000000000841200841300820000820000841C018200008200')
      .addBytesString('00842E2E2F617070732F427269636B2050726F6772616D2F4F6E427269636B496D6167653132008400821B0830006085')
      .addBytesString('8332000000403482020046646046821300348205004768604782080031604430006005444161820B00A5000161A60001')
      .addBytesString('40820400A30001004162820B00A5000262A6000240820400A30002004163820B00A5000463A6000440820400A3000400')
      .addBytesString('4164820B00A5000864A6000840820400A30008008640408285FF0A0A0A0A0A');

    outputValue = command.getHexOutput(self.commandCounter.getNext());
    self.btConnection.write(outputValue, callbackFunction);
  };


  /*
   * Command: Stop program in user slot 1 (equal to PROGRAM_STOP but initial message)
   */
  this._currentProgramStop = function(callbackFunction) {
    var
      outputValue,
      command = new self.commands.Command(
        self.enums.CommandTypes.DIRECT_COMMAND_NO_REPLY,
        self.enums.EV3Commands.CURRENT_PROGRAM_STOP,
        self.enums
      );

    command.addBytesString('0201');

    outputValue = command.getHexOutput(self.commandCounter.getNext());
    self.btConnection.write(outputValue, callbackFunction);
  };


  /*
   * Command: Start program bytecode file in user slot 1
   */
  this._programStart = function(callbackFunction) {
    var
      outputValue,
      command = new self.commands.Command(
        self.enums.CommandTypes.DIRECT_COMMAND_NO_REPLY,
        self.enums.EV3Commands.PROGRAM_START,
        self.enums
      );

    command
      // filename (ASCII, "/mnt/ramdisk/prjs/k.rbf")
      .addBytesString('C00801842F6D6E742F72616D6469736B2F70726A732F6B2E72626600')
      .addBytesString('40440301404440');

    outputValue = command.getHexOutput(self.commandCounter.getNext());
    self.btConnection.write(outputValue, callbackFunction);
  };


  /*
   * Command: Finish downloading program to brick
   */
  this._closeFileHandle = function(callbackFunction) {
    var
      outputValue,
      command = new self.commands.Command(
        self.enums.CommandTypes.SYSTEM_COMMAND_REPLY,
        self.enums.EV3Commands.CLOSE_FILEHANDLE,
        self.enums
      );

      // Hash
      command.addBytesString('0000');

    outputValue = command.getHexOutput(self.commandCounter.getNext());
    self.btConnection.write(outputValue, callbackFunction);
  };


  /*
   * Command: Stop program in user slot 1
   */
  this._programStop = function(callbackFunction) {
    var
      outputValue,
      command = new self.commands.Command(
        self.enums.CommandTypes.DIRECT_COMMAND_NO_REPLY,
        self.enums.EV3Commands.PROGRAM_STOP,
        self.enums
      );

    // Byte codes
    command.addBytesString('0201');

    outputValue = command.getHexOutput(self.commandCounter.getNext());
    self.btConnection.write(outputValue, callbackFunction);
  };

};

// -------------- Export -------------
exports.Robot = EV3Robot;