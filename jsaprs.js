
function PosTsMsg() {

// raw: 'DF8LJM-9>APX207,DB0HHN*,DB0ELB*,WIDE2*:@251727//3;D7Q&{ijbFCJens, with Raspberry Pi+XASTIR+THD7E',

    this.decodePosX = function(compressedLon) {
       var x1 = compressedLon.charCodeAt(0) - 33;
       var x2 = compressedLon.charCodeAt(1) - 33;
       var x3 = compressedLon.charCodeAt(2) - 33;
       var x4 = compressedLon.charCodeAt(3) - 33;
       return lon = -180 + (x1*91*91*91 + x2*91*91 + x3*91 + x4)/190463;
    };

    this.decodePosY = function(compressedLat) {
       var y1 = compressedLat.charCodeAt(0) - 33;
       var y2 = compressedLat.charCodeAt(1) - 33;
       var y3 = compressedLat.charCodeAt(2) - 33;
       var y4 = compressedLat.charCodeAt(3) - 33;
       return 90 - (y1*91*91*91 + y2*91*91 + y3*91 + y4)/380926;
    };


    this.parse = function(m){
        var timestamp = m.info.substring(1,8);
        m.timestamp = timestamp;

        //Check if compressed
        if (("/").indexOf(m.info[8]) > -1) {
          m.symbolTableIdentifier = m.info[8];
          var latCompressed = m.info.substring(9,13);
          var lonCompressed = m.info.substring(13,17);
          m.symbolCode = m.info[17];
          m.cs = m.info.substring(18,20);
          m.compressionTypeIndicator = m.info[20];
          m.lon = this.decodePosX(lonCompressed);
          m.lat = this.decodePosY(latCompressed);
          var c = m.info[18].charCodeAt(0) - 33;
          var s = m.info[19].charCodeAt(0) - 33;
          if (m.info[18] === '{') {
              m.range = 2 * Math.pow(1.08,s);
          }
          else if (c < 90) {
              m.course = c * 4;
              m.speed = Math.pow(1.08,s) - 1;
          }
          m.statusText = m.info.substring(21);
        }
        return m;
    };


}

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
    };


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
    };


    this.getSpeed = function(info) {
        var sp = info[4].charCodeAt(0);
        var dc = info[5].charCodeAt(0);
        var se = info[6].charCodeAt(0);

        var speed = (sp-28)*10 + (dc-28)/10;
        if (speed >= 800) speed = speed - 800;
        return speed;
    };
    
    this.getCourse = function(info) {
        var sp = info[4].charCodeAt(0);
        var dc = info[5].charCodeAt(0);
        var se = info[6].charCodeAt(0);

        var course = ((dc-28)%10) * 100;
        course = course + (se-28);
        if (course >= 400) course -= 400;
        return course;

    }

    this.getMessageBit = function(c) {
        if ("0123456789L".indexOf(c) > -1) return "0";
        if ("ABCDEFGHIJKPQRSTUVWXYZ".indexOf(c) > -1) return "1";

    };

    this.getMessage = function(dest){
        return this.MESSAGES['' + this.getMessageBit(dest[0]) + this.getMessageBit(dest[1]) + this.getMessageBit(dest[2])];
    };

    this.getAltitude = function (statusText) {
        return 0;
    }; 


    this.parse = function(m){
        var info = m.info.substring(0,9);
        m.mice_type = this.getDataType(info);
        m.latitude = this.getLatitude(m.destination);
        m.longitude = this.getLongitude(m.destination,info);
        m.mic_e_message = this.getMessage(m.destination);
        m.speed = this.getSpeed(info);
        m.course = this.getCourse(info);
        m.symbol = info[7];
        m.symbol_table = info[8];
        if ("`'\x1d".indexOf(info[9]) > -1) m.telemetry = true;
        var statusText = m.info.substring(10);
        if (statusText[3] === '}') {
            m.altitude = this.getAltitude(statusText);
            statusText = statusText.substring(4);
        }
        m.statusText = statusText;
        return m;
    };
}

function APRS(message) {
    this.raw = message;

    this.getSource = function() {
        return this.raw.split(">")[0].toUpperCase();
    };

    this.getPath = function() {
      return this.raw.split(">")[1].split(":")[0];
    };


    this.getType = function(c) {
        var types = {
            '0x1c':"Current MIC-E Data (Rev 0 beta)",
            '0x1d':"Old MIC-E Data (Rev 0 beta)",
            '!':"Position without timestamp (no APRS messaging), or Ultimeter 2000 WX Station",
            '#':"Peet Bros U-II Weather Station",
            '$':"Raw GPS data or Ultimeter 2000",
            '%':"Agrelo DFJr / MicroFinder",
            '&':"[Reserved — Map Feature]",
            "'":"Old MIC-E Data (but Current data for TM-D700)",
            ")":"Item",
            "*":"Peet Bros U-II Weather Station",
            "+":"[Reserved — Shelter data with time]",
            ",":"Invalid data or test data",
            ".":"[Reserved — Space weather]",
            "/":"Position with timestamp (no APRS messaging)",
            ":":"Message",
            ";":"Object",
            "<":"Station Capabilities",
            "=":"Position without timestamp (with APRS messaging)",
            ">":"Status",
            "?":"Query",
            "@":"Position with timestamp (with APRS messaging)",
            "T":"Telemetry data",
            "[":"Maidenhead grid locator beacon (obsolete)",
            "_":"Weather Report (without position)",
            "`":"Current MIC-E Data (not used in TM-D700)",
            "{":"User-Defined APRS packet format",
            "}":"Third-party traffic"
            
        }
        return types[c];
    }

    this.parseMessage = function(m) {
        var info = m.info.substring(1);
        m.recipient = info.substring(0,9).trim();
        m.text = info.substring(10).split("{")[0];
        m.msgId = info.substring(10).split("{")[1];
        return m;
    }

    this.parse = function() {
      var m = {}
      m.raw = this.raw;
      m.source = this.getSource();
      m.path = this.getPath();
      m.destination = m.path.split(",")[0];
      var i = m.raw.indexOf(":");
      m.info = m.raw.substring(i+1);
      m.type = this.getType(m.info[0]);
      var j = m.type.indexOf("MIC-E");
      if (m.type.indexOf('MIC-E') > -1) {
          var mic_e = new MICE();
          m = mic_e.parse(m);
      } else if (m.type === 'Message') {
         m = this.parseMessage(m);
      } else if (m.type === 'Position with timestamp (with APRS messaging)') {
         var posTsMsg = new PosTsMsg();
         m = posTsMsg.parse(m);
      }
      return m;
    };


}
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports.APRS = APRS;
}
