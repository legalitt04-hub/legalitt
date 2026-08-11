// src/utils/polyfills/soundPolyfill.js
// Web stub for react-native-sound — native module not available on web
function Sound(filename, basePath, onError) {
  if (onError) onError(null); // signal success
}
Sound.prototype.play = function(cb) { if (cb) cb(true); };
Sound.prototype.pause = function() {};
Sound.prototype.stop = function() {};
Sound.prototype.release = function() {};
Sound.prototype.setVolume = function() {};
Sound.prototype.setNumberOfLoops = function() {};
Sound.prototype.getDuration = function() { return 0; };
Sound.MAIN_BUNDLE = '';
Sound.LIBRARY = '';
Sound.DOCUMENT = '';

module.exports = Sound;
export default Sound;
