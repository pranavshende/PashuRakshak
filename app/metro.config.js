const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add custom extensions
config.resolver.assetExts.push('tflite');
config.resolver.assetExts.push('wasm');

module.exports = config;
