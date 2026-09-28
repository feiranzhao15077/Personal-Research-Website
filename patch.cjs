const fs = require('fs');
let content = fs.readFileSync('src/pages/index.astro', 'utf-8');
content = content.replace('import BaseLayout', 'import Hero from \'../components/Hero.astro\';\nimport BaseLayout');
content = content.replace(/<section class="hero"[\s\S]*?<\/section>/, '<Hero profile={profile} />');
fs.writeFileSync('src/pages/index.astro', content, 'utf-8');
