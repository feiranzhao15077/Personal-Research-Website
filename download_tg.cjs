const fs = require('fs');
const https = require('https');

https.get('https://unpkg.com/three-globe@2.45.2/dist/three-globe.min.js', (res) => {
    if (res.statusCode === 302) {
        https.get(res.headers.location, (res2) => {
            let data = '';
            res2.on('data', (chunk) => data += chunk);
            res2.on('end', () => {
                fs.writeFileSync('public/three-globe.min.js', data);
                console.log('Downloaded three-globe.min.js successfully. Size:', data.length);
            });
        });
    } else {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            fs.writeFileSync('public/three-globe.min.js', data);
            console.log('Downloaded three-globe.min.js successfully. Size:', data.length);
        });
    }
});
