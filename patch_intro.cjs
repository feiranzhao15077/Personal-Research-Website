const fs = require('fs');
let content = fs.readFileSync('src/components/Hero.astro', 'utf8');

const replacement =   const initIntro = () => {
    const hasSeenIntro = sessionStorage.getItem('hasSeenHeroIntro');
    
    if (hasSeenIntro) {
      gsap.set([
        ".simple-portrait-wrapper", 
        ".hero-titles > *", 
        ".hero-deck", 
        ".hero-note", 
        ".cta-row", 
        ".hero-links",
        ".hero-em-field",
        ".intro-sys-boot",
        ".drone-display",
        ".intro-char"
      ], { opacity: 1 });
      
      gsap.set(".hero-welcome", { clearProps: "all" });
      document.body.style.overflow = 'auto';
      return;
    }

    sessionStorage.setItem('hasSeenHeroIntro', 'true');

    // 1. Initial State Setup;

content = content.replace('  const initIntro = () => {\n    // 1. Initial State Setup', replacement);

fs.writeFileSync('src/components/Hero.astro', content, 'utf8');
