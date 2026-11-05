const fs = require('fs');
const https = require('https');

https.get('https://cdn.jsdelivr.net/npm/globe.gl@2.28.1/dist/globe.gl.min.js', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        fs.writeFileSync('public/globe.gl.min.js', data);
        console.log('Downloaded older globe.gl successfully. Size:', data.length);
    });
});
