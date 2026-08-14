/* ================================================
   LIQUID MAGNETIC CURSOR + TRAIL EFFECT
   ================================================ */

(function(){
  if(window.matchMedia("(hover: none)").matches) return;

  const dot = document.getElementById('cursorDot');
  const follower = document.getElementById('cursorFollower');
  if(!dot || !follower) return;

  let mouse = { x: 0, y: 0 };
  let pos = { x: 0, y: 0 };
  let speed = 0.15; // spring ease

  /* ---- Cursor Trail ---- */
  const TRAIL_COUNT = 12;
  const trailDots = [];
  const trailPositions = [];

  for(let i = 0; i < TRAIL_COUNT; i++){
    const el = document.createElement('div');
    el.className = 'trail-dot';
    el.style.opacity = '0';
    el.style.width = Math.max(2, 5 - i * 0.3) + 'px';
    el.style.height = el.style.width;
    document.body.appendChild(el);
    trailDots.push(el);
    trailPositions.push({ x: 0, y: 0 });
  }

  // Follow mouse
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    
    // Dot moves instantly
    dot.style.transform = `translate3d(calc(${mouse.x}px - 50%), calc(${mouse.y}px - 50%), 0)`;
  });

  // Follower + Trail interpolation
  const render = () => {
    pos.x += (mouse.x - pos.x) * speed;
    pos.y += (mouse.y - pos.y) * speed;
    follower.style.transform = `translate3d(calc(${pos.x}px - 50%), calc(${pos.y}px - 50%), 0)`;

    // Update trail — each dot follows the one before it
    for(let i = trailDots.length - 1; i >= 0; i--){
      const target = i === 0 ? { x: mouse.x, y: mouse.y } : trailPositions[i - 1];
      const trailSpeed = 0.25 - i * 0.015;
      
      trailPositions[i].x += (target.x - trailPositions[i].x) * trailSpeed;
      trailPositions[i].y += (target.y - trailPositions[i].y) * trailSpeed;
      
      trailDots[i].style.left = trailPositions[i].x + 'px';
      trailDots[i].style.top = trailPositions[i].y + 'px';
      trailDots[i].style.opacity = (0.4 - i * 0.03);
    }

    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);

  // Magnetic & Hover States
  const magnetics = document.querySelectorAll('.mag, a, button, .proj-img-wrap');
  magnetics.forEach(el => {
    el.addEventListener('mouseenter', () => follower.classList.add('active'));
    el.addEventListener('mouseleave', () => follower.classList.remove('active'));
  });

})();
