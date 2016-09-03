var assert = require('assert');
var aprs = require('../jsaprs.js');
console.log(aprs.APRS);
describe('Ma guggn', function(){
    it("Test1", function(){
        var a = new aprs.APRS("Hallo Welt");
        assert.equal("Hallo Welt",a.raw);
    });


});
