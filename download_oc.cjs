const fs = require('fs');
const https = require('https');

https.get('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        fs.writeFileSync('public/OrbitControls.js', data);
        console.log('Downloaded OrbitControls successfully. Size:', data.length);
    });
});
