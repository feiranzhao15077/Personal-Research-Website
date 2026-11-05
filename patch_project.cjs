const fs = require('fs');
let content = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');

const backButton = 
  <a href="/" class="floating-back" aria-label="返回首页">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
    <span>返回</span>
  </a>
;

// Insert just before </BaseLayout>
content = content.replace('</BaseLayout>', backButton + '\n</BaseLayout>');

fs.writeFileSync('src/pages/projects/[slug].astro', content, 'utf8');
