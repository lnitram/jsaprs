var assert = require('assert');
var jsaprs = require('../jsaprs.js');

var m1 = 'DK3ML>U3STQ9,WIDE1-1,WIDE2-1,qAS,DF5WXF-6:`\x7fFkl \x1c-/`"4,}APRS msg welcome_$';
var m2 = 'DK3ML>U3STQ8,WIDE1-1,WIDE2-1,qAS,DF5WXF-6:`\x7fFil#2-/`"4,}APRS msg welcome_$';
var m3 = 'DK3ML>U3STQ8,WIDE1-1,WIDE2-1,qAS,DF5WXF-6:`\x7fFil!]-/`"4+}APRS msg welcome_$';


var msg1 = 'WD9EWK-9>APK003,BWMTN,WIDE1*,WIDE2-2,qAR,KL1SF-10::DK3ML    :Hello from northern Arizona {88';
var msg2 = 'DK3ML>APY01D,WIDE1-1,WIDE2-1,qAR,DK3ML-10::WD9EWK-9 :Hello back from northern Germany{50';

describe('Parse MIC-E position message', function(){

    it("Test constructor", function(){
        var aprs = new jsaprs.APRS("Hallo Welt");
        assert.equal("Hallo Welt",aprs.raw);
    });

    it("Test Mic-E position message", function(){
        var aprs = new jsaprs.APRS(m1);
        var m = aprs.parse();
        assert.equal("DK3ML",m.source);
        assert.equal("U3STQ9,WIDE1-1,WIDE2-1,qAS,DF5WXF-6",m.path);
        assert.equal("U3STQ9",m.destination);
        assert.equal("Current MIC-E Data (not used in TM-D700)", m.type);
        assert.equal("Current GPS data",m.mice_type);
        assert.equal(53.569833333333335,m.latitude);
        assert.equal(9.713166666666666,m.longitude);
        assert.equal("M2: In Service",m.mic_e_message);
        assert.equal("-",m.symbol);
        assert.equal("/",m.symbol_table);
        console.log(m);
    });

   it("Test Mic-E with speed and course", function(){
       var aprs = new jsaprs.APRS(m3);
       var m = aprs.parse();
       assert.equal(165,m.course);
   });

});

describe('Parse Message', function() {

   it ("Test message", function() {
       var aprs = new jsaprs.APRS(msg1);
       var m = aprs.parse();
       assert.equal("WD9EWK-9",m.source);
       assert.equal("APK003,BWMTN,WIDE1*,WIDE2-2,qAR,KL1SF-10",m.path);
       assert.equal("APK003",m.destination);
       assert.equal("Message", m.type);
       assert.equal("DK3ML", m.recipient);
       assert.equal("Hello from northern Arizona ", m.text);
       assert.equal("88",m.msgId);
   });

   it ("", function() {
       var aprs = new jsaprs.APRS(msg1);
       var m = aprs.parse();
       console.log(m);
   });

});

