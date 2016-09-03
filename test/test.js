var assert = require('assert');
var jsaprs = require('../jsaprs.js');

var m1 = 'DK3ML>U3STQ9,WIDE1-1,WIDE2-1,qAS,DF5WXF-6:`\x7fFkl \x1c-/`"4,}APRS msg welcome_$';
var m2 = 'DK3ML>U3STQ8,WIDE1-1,WIDE2-1,qAS,DF5WXF-6:`\x7fFil#2-/`"4,}APRS msg welcome_$';
var m3 = ' DK3ML>U3STQ8,WIDE1-1,WIDE2-1,qAS,DF5WXF-6:`\x7fFil!]-/`"4+}APRS msg welcome_$';
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
        assert.equal("MIC-E", m.type);
        assert.equal("Current GPS data",m.datatype);
        assert.equal(53.569833333333335,m.latitude);
        assert.equal(9.713166666666666,m.longitude);
        assert.equal("M2: In Service",m.mic_e_message);
    });

   it("Test Mic-E with speed and course", function(){
       var aprs = new jsaprs.APRS(m3);
       var m = aprs.parse();
       assert.equal(165,m.course);
   });


});

