function APRS(message) {
    this.raw = message;
}
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports.APRS = APRS;
}
