const fs = require('fs');
const code = fs.readFileSync('public/globe.gl.min.js', 'utf8');

// Mock window and module
const myWindow = {};
const mySelf = myWindow;

const fn = new Function('window', 'self', 'globalThis', code + '\nreturn window;');
const result = fn(myWindow, mySelf, myWindow);

console.log('Keys in window:', Object.keys(myWindow));
