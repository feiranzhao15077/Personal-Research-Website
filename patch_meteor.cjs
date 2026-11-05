const fs = require('fs');
let content = fs.readFileSync('public/sphere-preview.html', 'utf8');

// Insert Meteor logic before section 6
const meteorLogic = 
    // 5.5 Meteors (Shooting Stars)
    const meteorCount = 15;
    const meteorGeo = new THREE.BufferGeometry();
    const meteorPos = new Float32Array(meteorCount * 2 * 3);
    const meteorMaterial = new THREE.LineBasicMaterial({
      color: 0xa8e6cf, // Mint green meteors
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const meteors = [];
    for (let i = 0; i < meteorCount; i++) {
      meteors.push({
        active: false,
        timer: Math.random() * 300,
        x: 0, y: 0, z: 0,
        vx: 0, vy: 0, vz: 0,
        length: 0
      });
    }
    const meteorLines = new THREE.LineSegments(meteorGeo, meteorMaterial);
    scene.add(meteorLines);

    // 6. Interaction: Mouse Tracking & Scrolling
;
content = content.replace('    // 6. Interaction: Mouse Tracking & Scrolling', meteorLogic);

// Insert Heartbeat GSAP logic
const introAnimOld =     // Intro Animation
    gsap.fromTo(sphereGroup.scale, 
      { x: 0.01, y: 0.01, z: 0.01 }, 
      { x: 1, y: 1, z: 1, duration: 3, ease: "power3.out" }
    );;

const introAnimNew =     // Intro Animation & Heartbeat
    gsap.fromTo(sphereGroup.scale, 
      { x: 0.01, y: 0.01, z: 0.01 }, 
      { 
        x: 1, y: 1, z: 1, 
        duration: 3, 
        ease: "power3.out",
        onComplete: () => {
          // Heartbeat pulse effect (lub-dub)
          const heartTl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });
          heartTl.to(sphereGroup.scale, { x: 1.03, y: 1.03, z: 1.03, duration: 0.15, ease: "power1.out" })
                 .to(sphereGroup.scale, { x: 1, y: 1, z: 1, duration: 0.15, ease: "power1.in" })
                 .to(sphereGroup.scale, { x: 1.015, y: 1.015, z: 1.015, duration: 0.12, ease: "power1.out" })
                 .to(sphereGroup.scale, { x: 1, y: 1, z: 1, duration: 0.12, ease: "power1.in" });
        }
      }
    );;
content = content.replace(introAnimOld, introAnimNew);

// Insert meteor animation loop
const animLoopOld =       // Background galaxy slowly spins
      dustParticles.rotation.y += 0.0003;;

const animLoopNew =       // Background galaxy slowly spins
      dustParticles.rotation.y += 0.0003;

      // Meteors Logic
      for (let i = 0; i < meteorCount; i++) {
        let m = meteors[i];
        if (!m.active) {
          m.timer -= 1;
          if (m.timer <= 0) {
            m.active = true;
            // Spawn above and slightly away
            m.x = (Math.random() - 0.5) * 1500;
            m.y = 800 + Math.random() * 400;
            m.z = (Math.random() - 0.5) * 1000 - 300;
            // High velocity shooting downwards
            m.vx = (Math.random() - 0.5) * 15;
            m.vy = -15 - Math.random() * 20;
            m.vz = Math.random() * 10;
            m.length = 80 + Math.random() * 100;
          }
        } else {
          m.x += m.vx;
          m.y += m.vy;
          m.z += m.vz;
          if (m.y < -1000) {
            m.active = false;
            m.timer = 50 + Math.random() * 200; // Reset
          }
        }
        
        const idx = i * 6;
        if (m.active) {
          meteorPos[idx] = m.x;
          meteorPos[idx+1] = m.y;
          meteorPos[idx+2] = m.z;
          // Tail stretches opposite to velocity
          meteorPos[idx+3] = m.x - m.vx * (m.length/15);
          meteorPos[idx+4] = m.y - m.vy * (m.length/15);
          meteorPos[idx+5] = m.z - m.vz * (m.length/15);
        } else {
          meteorPos[idx] = meteorPos[idx+1] = meteorPos[idx+2] = 0;
          meteorPos[idx+3] = meteorPos[idx+4] = meteorPos[idx+5] = 0;
        }
      }
      meteorGeo.setAttribute('position', new THREE.BufferAttribute(meteorPos, 3));
      meteorGeo.attributes.position.needsUpdate = true;;
content = content.replace(animLoopOld, animLoopNew);

fs.writeFileSync('public/sphere-preview.html', content, 'utf8');
