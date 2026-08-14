/* ================================================
   HERO PARTICLE CONSTELLATION — Interactive Neural Net
   Three.js particle system with connections
   ================================================ */
(function(){
  if(!window.THREE) return;

  const container = document.getElementById('heroVisual');
  if(!container) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'heroCanvas';
  container.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 30;

  let width = container.clientWidth;
  let height = container.clientHeight;

  function resize(){
    width = container.clientWidth;
    height = container.clientHeight;
    if(width === 0 || height === 0) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  resize();

  /* ---- Particle System ---- */
  const PARTICLE_COUNT = 180;
  const CONNECTION_DISTANCE = 4.5;
  const MOUSE_RADIUS = 8;

  // Generate positions in a soft sphere / brain-like cloud
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = [];
  const originalPositions = [];

  for(let i = 0; i < PARTICLE_COUNT; i++){
    // Clustered sphere distribution with some organic spread
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 7 + Math.random() * 5;
    
    const x = r * Math.sin(phi) * Math.cos(theta) + (Math.random() - 0.5) * 3;
    const y = r * Math.sin(phi) * Math.sin(theta) * 0.75 + (Math.random() - 0.5) * 2;
    const z = r * Math.cos(phi) * 0.5 + (Math.random() - 0.5) * 2;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    originalPositions.push({ x, y, z });
    velocities.push({
      x: (Math.random() - 0.5) * 0.008,
      y: (Math.random() - 0.5) * 0.008,
      z: (Math.random() - 0.5) * 0.005
    });
  }

  // Point sizes
  const sizes = new Float32Array(PARTICLE_COUNT);
  const alphas = new Float32Array(PARTICLE_COUNT);
  for(let i = 0; i < PARTICLE_COUNT; i++){
    sizes[i] = Math.random() * 3 + 1.5;
    alphas[i] = Math.random() * 0.5 + 0.5;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  particleGeo.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));

  const particleMat = new THREE.ShaderMaterial({
    uniforms: {
      uPixelRatio: { value: renderer.getPixelRatio() },
      uTime: { value: 0 }
    },
    vertexShader: `
      attribute float aSize;
      attribute float aAlpha;
      varying float vAlpha;
      uniform float uPixelRatio;
      uniform float uTime;
      void main(){
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vAlpha = aAlpha * (0.7 + 0.3 * sin(uTime * 1.5 + position.x * 0.5));
        gl_PointSize = aSize * uPixelRatio * (18.0 / -mvPos.z);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        if(d > 0.5) discard;
        float strength = 1.0 - smoothstep(0.0, 0.5, d);
        strength = pow(strength, 1.5);
        // Core: white-blue, outer: accent purple
        vec3 coreColor = vec3(0.75, 0.8, 1.0);
        vec3 glowColor = vec3(0.506, 0.549, 0.973);
        vec3 color = mix(glowColor, coreColor, strength);
        gl_FragColor = vec4(color, strength * vAlpha * 0.9);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  /* ---- Connection Lines ---- */
  const MAX_CONNECTIONS = 600;
  const linePositions = new Float32Array(MAX_CONNECTIONS * 6); // 2 points per line, 3 coords each
  const lineAlphas = new Float32Array(MAX_CONNECTIONS * 2);

  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeo.setAttribute('aAlpha', new THREE.BufferAttribute(lineAlphas, 1));

  const lineMat = new THREE.ShaderMaterial({
    vertexShader: `
      attribute float aAlpha;
      varying float vAlpha;
      void main(){
        vAlpha = aAlpha;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      void main(){
        vec3 color = mix(vec3(0.506, 0.549, 0.973), vec3(0.753, 0.522, 0.988), vAlpha);
        gl_FragColor = vec4(color, vAlpha * 0.35);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lineMesh);

  /* ---- Mouse Tracking ---- */
  const mouse3D = { x: 0, y: 0, tx: 0, ty: 0 };

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    mouse3D.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 28;
    mouse3D.ty = -((e.clientY - rect.top) / rect.height - 0.5) * 20;
  });

  container.addEventListener('mouseleave', () => {
    mouse3D.tx = 0;
    mouse3D.ty = 0;
  });

  /* ---- Scroll Fade ---- */
  let scrollOpacity = 1;
  window.addEventListener('scroll', () => {
    const heroEl = document.getElementById('hero');
    if(!heroEl) return;
    const heroH = heroEl.offsetHeight;
    const scrolled = window.scrollY;
    scrollOpacity = Math.max(0, 1 - (scrolled / (heroH * 0.6)));
    container.style.opacity = scrollOpacity;
  });

  /* ---- Render Loop ---- */
  const clock = new THREE.Clock();
  let globalRotation = 0;

  function animate(){
    requestAnimationFrame(animate);

    if(scrollOpacity <= 0) return; // Skip rendering when not visible

    const elapsed = clock.getElapsedTime();
    const delta = clock.getDelta();

    // Smooth mouse follow
    mouse3D.x += (mouse3D.tx - mouse3D.x) * 0.04;
    mouse3D.y += (mouse3D.ty - mouse3D.y) * 0.04;

    // Global slow rotation
    globalRotation += 0.001;
    particles.rotation.y = globalRotation + Math.sin(elapsed * 0.15) * 0.15;
    particles.rotation.x = Math.sin(elapsed * 0.1) * 0.08;
    lineMesh.rotation.copy(particles.rotation);

    // Update particle positions with organic drift + mouse interaction
    const pos = particleGeo.attributes.position.array;
    for(let i = 0; i < PARTICLE_COUNT; i++){
      const i3 = i * 3;
      const orig = originalPositions[i];
      const vel = velocities[i];

      // Organic drift
      pos[i3] += vel.x + Math.sin(elapsed * 0.3 + i * 0.1) * 0.003;
      pos[i3 + 1] += vel.y + Math.cos(elapsed * 0.25 + i * 0.15) * 0.003;
      pos[i3 + 2] += vel.z;

      // Soft return to original position
      pos[i3] += (orig.x - pos[i3]) * 0.003;
      pos[i3 + 1] += (orig.y - pos[i3 + 1]) * 0.003;
      pos[i3 + 2] += (orig.z - pos[i3 + 2]) * 0.003;

      // Mouse repulsion/attraction
      const dx = pos[i3] - mouse3D.x;
      const dy = pos[i3 + 1] - mouse3D.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if(dist < MOUSE_RADIUS && dist > 0.1){
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.15;
        pos[i3] += (dx / dist) * force;
        pos[i3 + 1] += (dy / dist) * force;
      }
    }
    particleGeo.attributes.position.needsUpdate = true;

    // Update connections
    let lineIdx = 0;
    const lPos = lineGeo.attributes.position.array;
    const lAlpha = lineGeo.attributes.aAlpha.array;

    for(let i = 0; i < PARTICLE_COUNT && lineIdx < MAX_CONNECTIONS; i++){
      for(let j = i + 1; j < PARTICLE_COUNT && lineIdx < MAX_CONNECTIONS; j++){
        const i3 = i * 3, j3 = j * 3;
        const dx = pos[i3] - pos[j3];
        const dy = pos[i3 + 1] - pos[j3 + 1];
        const dz = pos[i3 + 2] - pos[j3 + 2];
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

        if(dist < CONNECTION_DISTANCE){
          const alpha = 1 - (dist / CONNECTION_DISTANCE);
          const idx = lineIdx * 6;
          
          lPos[idx] = pos[i3];
          lPos[idx + 1] = pos[i3 + 1];
          lPos[idx + 2] = pos[i3 + 2];
          lPos[idx + 3] = pos[j3];
          lPos[idx + 4] = pos[j3 + 1];
          lPos[idx + 5] = pos[j3 + 2];
          
          lAlpha[lineIdx * 2] = alpha;
          lAlpha[lineIdx * 2 + 1] = alpha;
          
          lineIdx++;
        }
      }
    }

    // Clear remaining lines
    for(let i = lineIdx; i < MAX_CONNECTIONS; i++){
      const idx = i * 6;
      lPos[idx] = lPos[idx+1] = lPos[idx+2] = 0;
      lPos[idx+3] = lPos[idx+4] = lPos[idx+5] = 0;
      lAlpha[i*2] = lAlpha[i*2+1] = 0;
    }

    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.aAlpha.needsUpdate = true;
    lineGeo.setDrawRange(0, lineIdx * 2);

    // Update uniforms
    particleMat.uniforms.uTime.value = elapsed;

    renderer.render(scene, camera);
  }

  animate();

  /* ---- Resize Handler ---- */
  const resizeObserver = new ResizeObserver(() => resize());
  resizeObserver.observe(container);

  window.addEventListener('resize', resize);
})();
