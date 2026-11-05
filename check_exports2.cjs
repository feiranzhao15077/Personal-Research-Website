const fs = require('fs');
const code = fs.readFileSync('public/globe.gl.min.js', 'utf8');

const myWindow = {
    requestAnimationFrame: () => {},
    setTimeout: () => {},
    document: { createElement: () => ({ style: {} }), getElementsByTagName: () => [] }
};

const fn = new Function('window', 'self', 'globalThis', code + '\nreturn window;');
const result = fn(myWindow, myWindow, myWindow);

console.log('Keys in window:', Object.keys(myWindow));
