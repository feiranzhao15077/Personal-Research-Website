const fs = require('fs');
let content = fs.readFileSync('src/content/figures/FIG-QC-02.yaml', 'utf8');
content = content.replace('path: /evidence/originals/FIG-QC-02-d56acb62.svg', 'path: /evidence/originals/FIG-QC-02-71f22914.png');
content = content.replace('sourceHash: d56acb62397de943595d9277d21f280153eb15ad819018759cc1cdf18f63c13f', 'sourceHash: 71f229144946652d8d5404561e7769b95027a18269378168dda7effecf7c88f0');
content = content.replace('sourceSize: 11056', 'sourceSize: 940502');
content = content.replace('mime: image/svg+xml', 'mime: image/png');
fs.writeFileSync('src/content/figures/FIG-QC-02.yaml', content, 'utf8');
