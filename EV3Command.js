/*
 * Entity that manages an EV3 brick command
 * @TODO: Add most \lms2012\c_com\source\c_com.h functionality here, at enums, etc.
 */
var EV3Command = function(commandType, commandCode, enums) {
    this.parameters = [];
    this.enums = enums;
    this.commandType = commandType;
    this.commandCode = commandCode;

    /*
     * Return the hex EV3 code for the full command, ready to be sent to the brick
     */
    this.getHexOutput = function(commandCounter) {
        var
            header = this._getHeader(),
            body = this._getCommandCode() + this.parameters.join(''),
            size = ((commandCounter + header + body).length/2).toString(16);

        switch(size.length) {
            case 1:
                size = '0' + size + '00';
            break;
            case 2:
                size += '00';
            break;
            case 3:
                size = size.slice(-2) + '0' + size.slice(0,1);
            break;
            case 4:
                size = size.slice(-2) + size.slice(0,2);
            break;
        }
        console.log('> ' + (size + commandCounter + header + body).toUpperCase());
        return new Buffer((size + commandCounter + header + body).toUpperCase(), "hex");
    };

    /*
     * Add a parameter to the command
     */
    this.addNumericParameter = function(paramSize, paramValue) {
        this.parameters.push(this._getHexNumericParameterValue(paramSize, paramValue));
        return this;
    };

    /*
     * Raw adding of bytes
     */
    this.addBytesString = function(bytes) {
        this.parameters.push(bytes);
        return this;
    };

    /*
     * Add an output delimiter for commands that
     */
    this.addOutputDelimiter = function(delimiter) {
        this.parameters.push(delimiter);
        return this;
    };

    /*
     * Get the command code, for building the EV3 data
     */
    this._getCommandCode = function() {
        return this.enums.CommandCodeMappings[this.commandCode];
    };

    /*
     * Get the header EV3 hex data
     */
    this._getHeader = function() {
        switch(this.commandType) {
            case this.enums.CommandTypes.DIRECT_COMMAND_REPLY:
            case this.enums.CommandTypes.DIRECT_COMMAND_NO_REPLY:
                return this._getDirectCommandHeader();
            break;
            case this.enums.CommandTypes.SYSTEM_COMMAND_REPLY:
            case this.enums.CommandTypes.SYSTEM_COMMAND_NO_REPLY:
                return this._getSystemCommandHeader();
            break;
        }
    };

    /*
     * Get header data for direct commands
     */
    this._getDirectCommandHeader = function() {
        var headerHexValue = '';
        switch(this.commandCode) {
            case this.enums.EV3Commands.PLAY_TONE:
            case this.enums.EV3Commands.CURRENT_PROGRAM_STOP:
            case this.enums.EV3Commands.PROGRAM_STOP:
                headerHexValue = this.commandType + '0000';
            break;
            case this.enums.EV3Commands.MOVE_MULTI_MOTOR:
                headerHexValue = this.commandType + '0004';
            break;
            case this.enums.EV3Commands.PROGRAM_START:
                headerHexValue = this.commandType + '0020';
            break;
        }
        return headerHexValue;
    };

    /*
     * Get header data for system commands
     */
    this._getSystemCommandHeader = function() {
        var headerHexValue = '';
        switch(this.commandCode) {
            case this.enums.EV3Commands.SYSTEM_BEGIN_DOWNLOAD:
                headerHexValue = this.commandType + '0020';
            break;
            case this.enums.EV3Commands.CLOSE_FILEHANDLE:
            case this.enums.EV3Commands.SYSTEM_CONTINUE_DOWNLOAD:
                headerHexValue = this.commandType;
            break;
        }
        return headerHexValue;
    };

    /*
     * Get the hex EV3 parameter value
     */
    this._getHexNumericParameterValue = function(paramSize, paramValue) {
        var
            tempValue = "",
            numBytes = 0,
            isPositive = true;

        if (paramValue < 0) {
            isPositive = false;
            paramValue = -paramValue;
        }

        // check limits in size. Instead of failing just go down to max.value
        // @TODO: Check if can be unsigned
        switch(paramSize) {
            case this.enums.Parameters.BYTE:
                if (paramValue >= 128) {    // 2^7  : 128
                    paramValue = 128;
                }
                if (!isPositive) {
                    paramValue = 256 - paramValue;
                }
                numBytes = this.enums.ParameterSizes.BYTE;
            break;
            case this.enums.Parameters.SHORT:
                if (paramValue > 32768) {   // 2^15 : 32768
                    paramValue = 32768;
                }
                if (!isPositive) {
                    paramValue = 65536 - paramValue;
                }
                numBytes = this.enums.ParameterSizes.SHORT;
            break;
            case this.enums.Parameters.UINT:
                if (paramValue > 4294967296) {  // 2^32 : 4294967296
                    paramValue = 4294967296;
                }
                isPositive = true;
                numBytes = this.enums.ParameterSizes.UINT;
            break;
        }

        tempValue = paramValue.toString(16);
        if ((numBytes*2) - tempValue.length !== 0) {
            tempValue =  (new Array((numBytes*2) - tempValue.length+1).join('0')) + tempValue;
        }
        // Convert to little endian
        switch(paramSize) {
            case this.enums.Parameters.SHORT:
                tempValue = tempValue.slice(-2) + tempValue.slice(0,2);
            break;
            case this.enums.Parameters.UINT:
                tempValue = tempValue.slice(-2) + tempValue.slice(-4,-2) + tempValue.slice(-6,-4) + tempValue.slice(0,2);
            break;
        }

        return paramSize + tempValue;
    };
};

// -------------- Export -------------
exports.Command = EV3Command;