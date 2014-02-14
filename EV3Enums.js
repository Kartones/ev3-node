
/*
 *  Enumerations used in the module
 *  @internal All hex values set as strings to avoid constantly casting using xxx.toString(16)
 */
var EV3Enums = function() {

    /*
     * Commands supported by this library
     * TODO: Keep adding from c_com.h and c_com.c EV3 OS source files
     */
    this.EV3Commands = {
        MOVE_MULTI_MOTOR            : 1,
        PLAY_TONE                   : 2,
        SYSTEM_BEGIN_DOWNLOAD       : 3,
        SYSTEM_CONTINUE_DOWNLOAD    : 4,
        CURRENT_PROGRAM_STOP        : 5,
        PROGRAM_START               : 6,
        CLOSE_FILEHANDLE            : 7,
        PROGRAM_STOP                : 8
    };

    /*
     * Command types
     */
    this.CommandTypes = {
        // Direct command, reply required
        DIRECT_COMMAND_REPLY    : '00',
        // Direct command, reply not required
        DIRECT_COMMAND_NO_REPLY : '80',
        // System command, reply required
        SYSTEM_COMMAND_REPLY    : '01',
        // System command, reply not required
        SYSTEM_COMMAND_NO_REPLY : '81'
    };

    /*
     * Most commands add codes to the body payload/data
     * @TODO: This might be all removed and added as bytestring inside commands
     */
    this.CommandCodeMappings = {};
    // Direct commands
    this.CommandCodeMappings[this.EV3Commands.MOVE_MULTI_MOTOR]     = '';
    // @TODO: Check if can be moved as header fragment instead of here, as most direct commands don't use this
    this.CommandCodeMappings[this.EV3Commands.PLAY_TONE]            = '9401';
    this.CommandCodeMappings[this.EV3Commands.CURRENT_PROGRAM_STOP] = '';
    this.CommandCodeMappings[this.EV3Commands.PROGRAM_START]        = '';
    this.CommandCodeMappings[this.EV3Commands.PROGRAM_STOP]         = '';
    // System commands
    this.CommandCodeMappings[this.EV3Commands.SYSTEM_BEGIN_DOWNLOAD]    = '92';
    this.CommandCodeMappings[this.EV3Commands.SYSTEM_CONTINUE_DOWNLOAD] = '93';
    this.CommandCodeMappings[this.EV3Commands.CLOSE_FILEHANDLE]         = '98';

    this.Delimiters = {
        OUTPUT : '30',
        OUTPUT_BODY : '407E01820000'
    };

    /*
     * Parameter sizes in bytes
     * @internal Little-endian encoded
     */
    this.ParameterSizes = {
        BYTE    : 1,
        SHORT   : 2,
        UINT    : 4
    };

    /*
     * Parameters accepted by the brick. Value is internal EV3 hex notation for the parameter type.
     * @internal Always prepended to each command parameter to indicate its size
     */
    this.Parameters = {
        BYTE    : '81',
        SHORT   : '82',
        UINT    : '83'
    };
};


// -------------- Export -------------
exports.Enums = EV3Enums;