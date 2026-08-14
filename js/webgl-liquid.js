/* ================================================
   WEBGL LIQUID BACKGROUND (THREE.JS)
   Ambient fluid noise shader — background only
   ================================================ */

(function(){
  if(!window.THREE) return;

  const canvas = document.getElementById('webgl-canvas');
  if(!canvas) return;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: false
  });
  
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  let mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  let scrollProgress = 0;

  window.addEventListener('mousemove', (e) => {
    mouse.tx = e.clientX / window.innerWidth;
    mouse.ty = 1.0 - (e.clientY / window.innerHeight);
  });

  window.addEventListener('scroll', () => {
    scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight || 1);
  });

  /* ======== BACKGROUND FLUID SHADER ======== */
  const bgGeo = new THREE.PlaneGeometry(2, 2);
  const bgMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uScroll: { value: 0 },
      uRes: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision mediump float;
      varying vec2 vUv;
      uniform float uTime, uScroll;
      uniform vec2 uMouse, uRes;

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m * m; m = m * m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 uv = vUv;
        float asp = uRes.x / uRes.y;
        vec2 p = uv * vec2(asp, 1.0);

        // Mouse distortion — strong
        vec2 mOff = (uMouse - vec2(0.5)) * 1.4;
        float mDist = length(uv - uMouse);
        float mPull = smoothstep(0.6, 0.0, mDist) * 0.45;

        float t = uTime * 0.09;
        float n1 = snoise(p * 1.5 + vec2(t, t * 0.6) + mOff * 0.7 + vec2(mPull));
        float n2 = snoise(p * 2.8 + vec2(-t * 0.4, t * 0.3) - mOff * 0.5);
        float n3 = snoise(p * 4.2 + vec2(t * 0.2, -t * 0.4) + mOff * 1.2);
        float n4 = snoise(p * 6.0 + vec2(mPull * 2.5, t * 0.15));

        float n = n1 * 0.42 + n2 * 0.28 + n3 * 0.18 + n4 * 0.12;
        float blend = n * 0.5 + 0.5;

        // === CURSOR-REACTIVE COLOR PALETTE (STRONG) ===
        // Mouse X: hue shift — left=cool teal, right=warm magenta
        // Mouse Y: brightness boost — bottom=dim, top=bright
        float hueShift = uMouse.x;
        float brightBoost = uMouse.y * 0.12 + 0.10;

        // 4 color stops
        vec3 teal    = vec3(0.0, 0.80, 0.92);
        vec3 indigo  = vec3(0.506, 0.549, 0.973);
        vec3 purple  = vec3(0.659, 0.545, 0.984);
        vec3 magenta = vec3(0.93, 0.42, 0.98);
        vec3 dark    = vec3(0.024, 0.024, 0.039);

        // Scroll secondary shift
        float sc = uScroll * 3.14159;
        float scrollMix = sin(sc) * 0.5 + 0.5;

        // Cursor X drives palette selection — STRONG blending
        vec3 coolBlend = mix(teal, indigo, blend);
        vec3 warmBlend = mix(purple, magenta, blend);
        vec3 paletteMix = mix(coolBlend, warmBlend, hueShift);

        // Scroll shifts secondarily
        vec3 scrolledColor = mix(paletteMix, mix(indigo, purple, blend), scrollMix * 0.3);

        // Final: mix dark base with vivid color — STRONGER
        vec3 col = mix(dark, scrolledColor, brightBoost + n * 0.10);

        // Mouse glow — STRONG aurora spotlight
        float glowInner = smoothstep(0.55, 0.0, mDist) * 0.20;
        float glowOuter = smoothstep(0.85, 0.05, mDist) * 0.08;
        vec3 glowColor = mix(indigo, mix(purple, magenta, hueShift), 0.5);
        col += glowColor * (glowInner + glowOuter);

        // Glow ring — visible halo
        float ring = smoothstep(0.025, 0.0, abs(mDist - 0.22)) * 0.05;
        col += glowColor * ring;

        // Vignette
        float vig = 1.0 - smoothstep(0.2, 1.2, length(uv - 0.5));
        col *= 0.72 + vig * 0.28;

        gl_FragColor = vec4(col, 1.0);
      }
    `
  });
  
  scene.add(new THREE.Mesh(bgGeo, bgMat));

  /* ======== RENDER LOOP ======== */
  const clock = new THREE.Clock();
  
  function render() {
    const elapsedTime = clock.getElapsedTime();
    
    // Smooth mouse follow
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    
    // Update uniforms
    bgMat.uniforms.uTime.value = elapsedTime;
    bgMat.uniforms.uMouse.value.set(mouse.x, mouse.y);
    bgMat.uniforms.uScroll.value = scrollProgress;
    
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  
  requestAnimationFrame(render);

  /* ======== RESIZE ======== */
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    bgMat.uniforms.uRes.value.set(window.innerWidth, window.innerHeight);
  });

})();
