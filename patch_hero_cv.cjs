const fs = require('fs');
let content = fs.readFileSync('src/components/Hero.astro', 'utf8');

content = content.replace(
  '<a class="button subtle" href="/cv">',
  '{cvUrl && (<a class="button subtle" href={cvUrl} target="_blank" rel="noopener noreferrer">'
);

content = content.replace(
  '学术简介 (CV) <span class="btn-arrow" aria-hidden="true">↗</span>\n            </a>',
  '学术简介 (CV) <span class="btn-arrow" aria-hidden="true">↗</span>\n            </a>)}'
);

fs.writeFileSync('src/components/Hero.astro', content, 'utf8');
