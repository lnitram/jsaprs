function MICE() {

    this.T = {
        "K":0,"L":0,"Z":0,
        "0":0,"1":1,"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,
        "A":0,"B":1,"C":2,"D":3,"E":4,"F":5,"G":6,"H":7,"I":8,"J":9,
        "P":0,"Q":1,"R":2,"S":3,"T":4,"U":5,"V":6,"W":7,"X":8,"Y":9
    };

    this.MESSAGES = {
        "111":"M0: Off Duty",
        "110":"M1: En Route",
        "101":"M2: In Service",
        "100":"M3: Returning",
        "011":"M4: Committed",
        "010":"M5: Special",
        "001":"M6: Priority",
        "000":"EMERGENCY"
    };


    this.getDataType = function(mic_e_info){
        if (mic_e_info[0] === '`') return "Current GPS data";
        if (mic_e_info[0] === "'") return "Old GPS data";
        if (mic_e_info[0] === "\x1c") return "Current GPS data, rev.0 beta unit";
        if (mic_e_info[0] === "\x1d") return "Old GPS data, rev.0 beta unit";
    };

    this.getLatitude = function(dest) {
          var lat_deg = this.T[dest[0]] * 10 + this.T[dest[1]];
          var lat_min = (this.T[dest[2]] * 1000 + this.T[dest[3]] * 100 + this.T[dest[4]] * 10 + this.T[dest[5]])/100;
          var lat = lat_deg + lat_min/60;
          if ("0123456789L".indexOf(dest[3]) > -1) lat = lat * -1;
          if ("PQRSTUVWXYZ".indexOf(dest[3]) > -1) lat = lat * 1;
          return lat;
    };

    this.getLonOffset = function(dest) {
        if (("0123456789L").indexOf(dest[4]) > -1) return 0;
        if (("PQRSTUVWXYZ").indexOf(dest[4]) > -1) return 100;
    }

    this.getLongitude = function(dest,info) {
        var lonOffset = this.getLonOffset(dest);
        var lon = 0;
        var lon_min = 0;
        var val = info[1].charCodeAt(0);
        if (lonOffset == 100) {
            if (val >= 118 && val <= 127) lon =  val -118;
            if (val >= 108 && val <= 117) lon =  val -8;
            if (val >= 38 && val <= 107) lon =  val + 72;
        } else {
            if (val >= 38 && val <= 127) lon =  val - 28;
        }

        val = info[2].charCodeAt(0);
        val = val - 28;
        if (val >= 60) val = val - 60;
        lon_min = val;
        val = info[3].charCodeAt(0) - 28;
        lon_min = ((lon_min * 100) + val)/100;
        lon = (lon + lon_min/60);
        if ("0123456789L".indexOf(dest[3]) > -1) lon = lon * -1;
        if ("PQRSTUVWXYZ".indexOf(dest[3]) > -1) lon = lon * 1;
        return lon;
    }

    this.getMessageBit = function(c) {
        if ("0123456789L".indexOf(c) > -1) return "0";
        if ("ABCDEFGHIJKPQRSTUVWXYZ".indexOf(c) > -1) return "1";

    };

    this.getMessage = function(dest){
        return this.MESSAGES['' + this.getMessageBit(dest[0]) + this.getMessageBit(dest[1]) + this.getMessageBit(dest[2])];
    }; 


    

    this.parse = function(m){
        var info = m.payload.substring(0,9);
        m.datatype = this.getDataType(info);
        m.latitude = this.getLatitude(m.destination);
        m.longitude = this.getLongitude(m.destination,info);
        m.mic_e_message = this.getMessage(m.destination);
        return m;
    }
}

function APRS(message) {
    this.raw = message;

    this.getSource = function() {
        return this.raw.split(">")[0].toUpperCase();
    };

    this.getPath = function() {
      return this.raw.split(">")[1].split(":")[0];
    };

    this.parseMicE = function(m) {
        
        var mic_e = new MICE();
        m = mic_e.parse(m);
      
 //       m.latitude = getLatitude(m.destination);
   //     m.longitude = getLongitude(m.destination, mice_info);
    //    m.msg = getMessage(m.destination);
        return m;
    };

    this.parse = function() {
      var m = {}
      m.raw = this.raw;
      m.source = this.getSource();
      m.path = this.getPath();
      m.destination = m.path.split(",")[0];
      m.type = m.destination.startsWith("AP")?"APRS":"MIC-E";
      m.payload =  m.raw.split(":")[1];
      if (m.type === "MIC-E") {
          m = this.parseMicE(m);
      }
      return m;
    };


}
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports.APRS = APRS;
}
