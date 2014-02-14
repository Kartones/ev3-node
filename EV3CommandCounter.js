

var EV3CommandCounter = function(initialValue) {
	var commandCounter = initialValue;

	this.getNext = function() {
		var counterString = commandCounter.toString(16);
		commandCounter++;

		switch(counterString.length) {
      case 1:
        counterString = '0' + counterString + '00';
      break;
      case 2:
        counterString += '00';
      break;
      case 3:
        counterString = counterString.slice(-2) + '0' + counterString.slice(0,1);
      break;
      case 4:
        counterString = counterString.slice(-2) + counterString.slice(0,2);
      break;
    }
		return counterString;
	}
};

// -------------- Export -------------
exports.CommandCounter = EV3CommandCounter;