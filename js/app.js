/* ================================================
   PORTFOLIO v7: RECRUITER-WOW LEVEL (APP.JS)
   Premium preloader, card tilt, scroll progress,
   enhanced reveals, particle constellation integration
   ================================================ */
(function(){
  gsap.registerPlugin(ScrollTrigger);

  /* LENIS SMOOTH SCROLL */
  let lenis;
  try {
    lenis = new Lenis({ duration:1.4, easing:(t)=>Math.min(1,1.001-Math.pow(2,-10*t)), smoothWheel:true, wheelMultiplier:1.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time)=>{ lenis.raf(time*1000); });
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(link=>{
      link.addEventListener('click',(e)=>{
        const target=document.querySelector(link.getAttribute('href'));
        if(target){ e.preventDefault(); lenis.scrollTo(target,{offset:-72}); }
      });
    });
  } catch(e){ console.warn("Lenis failed",e); }

  /* NAVBAR SCROLL */
  const navbar=document.getElementById('navbar');
  if(navbar) window.addEventListener('scroll',()=>{ navbar.classList.toggle('scrolled',window.scrollY>60); });

  /* MOBILE MENU */
  const hamburger=document.getElementById('hamburger');
  const mobileMenu=document.getElementById('mobileMenu');
  if(hamburger&&mobileMenu){
    hamburger.addEventListener('click',()=>{
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow=mobileMenu.classList.contains('active')?'hidden':'';
    });
    mobileMenu.querySelectorAll('.mobile-link').forEach(link=>{
      link.addEventListener('click',()=>{
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow='';
      });
    });
  }

  /* TYPED TEXT — Rotating Roles */
  const typedEl = document.getElementById('typedText');
  if(typedEl){
    const roles = ['AI Engineer.','Data Scientist.','Cloud Architect.','Full-Stack Developer.','ML Researcher.'];
    let roleIdx = 0, charIdx = 0, isDeleting = false;
    function typeStep(){
      const current = roles[roleIdx];
      if(!isDeleting){
        typedEl.textContent = current.substring(0, charIdx + 1);
        charIdx++;
        if(charIdx === current.length){
          isDeleting = true;
          setTimeout(typeStep, 2000);
          return;
        }
        setTimeout(typeStep, 80 + Math.random() * 40);
      } else {
        typedEl.textContent = current.substring(0, charIdx - 1);
        charIdx--;
        if(charIdx === 0){
          isDeleting = false;
          roleIdx = (roleIdx + 1) % roles.length;
          setTimeout(typeStep, 400);
          return;
        }
        setTimeout(typeStep, 40);
      }
    }
    setTimeout(typeStep, 1200);
  }

  /* SOCIAL SIDEBAR — Show on scroll */
  const sidebar = document.getElementById('socialSidebar');
  if(sidebar){
    window.addEventListener('scroll', () => {
      sidebar.classList.toggle('visible', window.scrollY > 400);
    });
  }

  /* BACK TO TOP */
  const btt = document.getElementById('backToTop');
  if(btt){
    window.addEventListener('scroll', () => {
      btt.classList.toggle('visible', window.scrollY > 600);
    });
    btt.addEventListener('click', () => {
      if(lenis) lenis.scrollTo(0);
      else window.scrollTo({ top:0, behavior:'smooth' });
    });
  }

  /* SCROLL PROGRESS BAR */
  const scrollProgress = document.getElementById('scrollProgress');
  if(scrollProgress){
    window.addEventListener('scroll', () => {
      const docH = document.body.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? (window.scrollY / docH) * 100 : 0;
      scrollProgress.style.width = pct + '%';
    });
  }

  /* ACTIVE NAV — Section tracking */
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  if(navLinks.length){
    const sections = [];
    navLinks.forEach(link => {
      const sec = document.querySelector(link.getAttribute('href'));
      if(sec) sections.push({ el:sec, link });
    });
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          navLinks.forEach(l => l.classList.remove('active'));
          const match = sections.find(s => s.el === entry.target);
          if(match) match.link.classList.add('active');
        }
      });
    }, { rootMargin:'-40% 0px -55% 0px' });
    sections.forEach(s => navObserver.observe(s.el));
  }

  /* ACHIEVEMENT TABS */
  const tabsNav = document.getElementById('tabsNav');
  if (tabsNav) {
    const btns = tabsNav.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.tab-panel');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const panel = document.getElementById('tab-' + btn.dataset.tab);
        if (panel) panel.classList.add('active');
      });
    });
  }

  /* COURSE DROPDOWN TOGGLE */
  const courseToggle = document.getElementById('googleCourseToggle');
  const courseDropdown = document.getElementById('googleCourseDropdown');
  if (courseToggle && courseDropdown) {
    courseToggle.addEventListener('click', () => {
      const isOpen = courseDropdown.classList.toggle('open');
      courseToggle.setAttribute('aria-expanded', isOpen);
    });
  }

  /* PROJECT SLIDERS */
  const sliders = document.querySelectorAll('.card-slider');
  sliders.forEach(slider => {
    const track = slider.querySelector('.slider-track');
    const slides = slider.querySelectorAll('.slider-slide');
    const prevBtn = slider.querySelector('.slider-btn.prev');
    const nextBtn = slider.querySelector('.slider-btn.next');
    const dotsContainer = slider.querySelector('.slider-dots');
    
    if(!track || slides.length <= 1) return;
    
    let currentIndex = 0;
    
    // Create dots
    slides.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = `slider-dot ${i === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    });
    const dots = slider.querySelectorAll('.slider-dot');
    
    function goToSlide(index) {
      if(index < 0) index = slides.length - 1;
      if(index >= slides.length) index = 0;
      currentIndex = index;
      
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }
    
    if(prevBtn) prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goToSlide(currentIndex - 1);
    });
    
    if(nextBtn) nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goToSlide(currentIndex + 1);
    });
  });

  /* ================================================
     CINEMATIC PRELOADER — SVG Ring + Bar + Radial Zoom Exit
     ================================================ */
  const preloader = document.getElementById('preloader');
  const preCounterNum = document.getElementById('preCounterNum');
  const preRingFill = document.getElementById('preRingFill');
  const preBarFill = document.getElementById('preBarFill');
  const preParticles = document.getElementById('preParticles');

  const RING_CIRCUMFERENCE = 2 * Math.PI * 54; // ~339.292

  if(preloader && preCounterNum){
    // Disable scroll during preload
    if(lenis) lenis.stop();
    document.body.style.overflow = 'hidden';

    let progress = 0;
    const duration = 2800; // total preload time in ms
    const startTime = performance.now();

    function updateProgress(now) {
      const elapsed = now - startTime;
      const raw = Math.min(elapsed / duration, 1);
      
      // Smooth ease-out quartic for fluid feel
      progress = 1 - Math.pow(1 - raw, 4);
      
      const pctValue = Math.round(progress * 100);
      preCounterNum.textContent = pctValue;

      // Update SVG ring
      if(preRingFill){
        const offset = RING_CIRCUMFERENCE * (1 - progress);
        preRingFill.style.strokeDashoffset = offset;
      }

      // Update horizontal bar
      if(preBarFill){
        preBarFill.style.width = (progress * 100) + '%';
      }

      if(raw < 1) {
        requestAnimationFrame(updateProgress);
      } else {
        preCounterNum.textContent = '100';
        if(preRingFill) preRingFill.style.strokeDashoffset = '0';
        if(preBarFill) preBarFill.style.width = '100%';
        finishPreload();
      }
    }
    requestAnimationFrame(updateProgress);

  } else {
    initReveals();
  }

  function finishPreload(){
    const tl = gsap.timeline({
      onComplete: () => {
        preloader.classList.add('done');
        preloader.style.display = 'none';
        document.body.style.overflow = '';
        if(lenis) lenis.start();
        initReveals();
      }
    });

    // 1. Spawn and burst particles
    if(preParticles){
      const particleCount = 40;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      for(let i = 0; i < particleCount; i++){
        const p = document.createElement('div');
        p.className = 'pre-particle';
        p.style.left = cx + 'px';
        p.style.top = cy + 'px';
        const size = (Math.random() * 5 + 2);
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        const colors = ['#818cf8','#a78bfa','#c084fc','#e879f9','#f0f0f2'];
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.boxShadow = `0 0 ${Math.random()*10+4}px ${p.style.background}`;
        preParticles.appendChild(p);

        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
        const dist = 200 + Math.random() * 400;

        gsap.to(p, {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          opacity: 1,
          duration: 0.2,
          delay: i * 0.008,
          ease: 'power2.out'
        });
        gsap.to(p, {
          opacity: 0,
          scale: 0.2,
          duration: 0.6,
          delay: 0.25 + i * 0.008,
          ease: 'power2.in'
        });
      }
    }

    // 2. Scale up logo + blur with radial zoom
    tl.to('.pre-inner', {
      opacity: 0, scale: 2.5, filter: 'blur(20px)',
      duration: 0.7, ease: 'power3.in',
      delay: 0.35
    });

    // 3. Fade out blobs with scale
    tl.to('.pre-blob', {
      opacity: 0, scale: 2,
      duration: 0.5, ease: 'power2.in',
      stagger: 0.04
    }, '-=0.5');

    // 4. Fade out progress bar
    tl.to('.pre-bar', {
      opacity: 0,
      duration: 0.3, ease: 'power2.in'
    }, '-=0.4');

    // 5. Radial fade out the entire preloader
    tl.to(preloader, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.inOut'
    }, '-=0.2');
  }

  /* ================================================
     CARD 3D TILT EFFECT
     ================================================ */
  function initCardTilt(){
    // Skip 3D tilt on touch devices
    if(window.matchMedia("(hover: none)").matches) return;
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        
        const tiltX = (y - 0.5) * -6; // degrees
        const tiltY = (x - 0.5) * 6;
        
        card.classList.add('tilting');
        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
      });
      
      card.addEventListener('mouseleave', () => {
        card.classList.remove('tilting');
        card.style.transform = '';
        card.style.transition = 'transform 0.5s var(--ease-out)';
        setTimeout(() => { card.style.transition = ''; }, 500);
      });
    });
  }

  /* ================================================
     PREMIUM SCROLL REVEALS
     ================================================ */
  function initReveals(){
    // Hero entrance sequence
    const heroTl = gsap.timeline({ delay: 0.1 });

    heroTl.fromTo('.status-badge',
      { opacity:0, y:15, scale:0.9 },
      { opacity:1, y:0, scale:1, duration:0.6, ease:'power3.out' }
    );
    heroTl.fromTo('.hero-greeting',
      { opacity:0, y:20, filter:'blur(8px)' },
      { opacity:1, y:0, filter:'blur(0px)', duration:0.7, ease:'power3.out' },
      '-=0.3'
    );

    // Split-character headline reveal
    const headlineLines = document.querySelectorAll('.hero-line');
    headlineLines.forEach((line, lineIdx) => {
      const text = line.textContent;
      // Check if it contains the gradient-text span
      const gradientSpan = line.querySelector('.gradient-text');
      if(gradientSpan){
        const chars = gradientSpan.textContent;
        gradientSpan.innerHTML = '';
        chars.split('').forEach((char, i) => {
          const span = document.createElement('span');
          span.className = 'hero-split-char gradient-char';
          span.textContent = char;
          // Apply gradient to each char individually since background-clip:text
          // doesn't work across parent→child boundaries
          span.style.cssText = `display:inline-block;opacity:0;transform:translateY(60px) rotate(5deg);filter:blur(4px);background:linear-gradient(135deg,#818cf8 0%,#a78bfa 30%,#c084fc 60%,#e879f9 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;background-size:200% 200%;`;
          gradientSpan.appendChild(span);
        });
      } else {
        const chars = line.textContent;
        line.innerHTML = '';
        chars.split('').forEach((char, i) => {
          const span = document.createElement('span');
          span.className = 'hero-split-char';
          span.textContent = char === ' ' ? '\u00A0' : char;
          span.style.cssText = `display:inline-block;opacity:0;transform:translateY(60px) rotate(5deg);filter:blur(4px);`;
          line.appendChild(span);
        });
      }
    });

    const splitChars = document.querySelectorAll('.hero-split-char');
    heroTl.to(splitChars, {
      opacity:1, y:0, rotation:0, filter:'blur(0px)',
      duration:0.7, ease:'power4.out',
      stagger:0.03
    }, '-=0.3');

    heroTl.fromTo('.hero-roles',
      { opacity:0, y:20 },
      { opacity:1, y:0, duration:0.7, ease:'power3.out' },
      '-=0.3'
    );
    heroTl.fromTo('.hero-badge',
      { opacity:0, y:20, scale:0.95 },
      { opacity:1, y:0, scale:1, duration:0.7, ease:'power3.out' },
      '-=0.5'
    );
    heroTl.fromTo('.hero-pitch',
      { opacity:0, y:30, filter:'blur(6px)' },
      { opacity:1, y:0, filter:'blur(0px)', duration:0.8, ease:'power3.out' },
      '-=0.4'
    );
    heroTl.fromTo('.hero-actions',
      { opacity:0, y:30 },
      { opacity:1, y:0, duration:0.8, ease:'power3.out' },
      '-=0.4'
    );
    heroTl.fromTo('.hero-socials',
      { opacity:0, y:20 },
      { opacity:1, y:0, duration:0.7, ease:'power3.out' },
      '-=0.4'
    );

    // Hero visual — fade in with scale
    heroTl.fromTo('.hero-visual',
      { opacity:0, scale:0.85, filter:'blur(10px)' },
      { opacity:1, scale:1, filter:'blur(0px)', duration:1.2, ease:'power3.out' },
      '-=1.0'
    );

    heroTl.fromTo('.hero-scroll-hint',
      { opacity:0 },
      { opacity:1, duration:1, ease:'power2.out' },
      '-=0.2'
    );

    // Impact metrics — count-up animation
    document.querySelectorAll('.metric-number').forEach(num => {
      const target = parseInt(num.dataset.target) || 0;
      gsap.fromTo(num, { textContent: 0 }, {
        textContent: target,
        duration: 1.5,
        ease: 'power2.out',
        snap: { textContent: 1 },
        scrollTrigger: { trigger: num, start: 'top 90%', once: true }
      });
    });

    // Metric cards — stagger reveal
    const metricCards = document.querySelectorAll('.metric-card');
    if(metricCards.length){
      gsap.fromTo(metricCards,
        { opacity:0, y:40, scale:0.9 },
        {
          opacity:1, y:0, scale:1,
          duration:0.7, ease:'power3.out',
          stagger:0.12,
          scrollTrigger:{ trigger:'.metrics-grid', start:'top 88%', once:true }
        }
      );
    }

    // Glass cards — staggered reveal with blur
    document.querySelectorAll('.glass-card').forEach((el)=>{
      gsap.fromTo(el,
        { opacity:0, y:50, filter:'blur(6px)' },
        {
          opacity:1, y:0, filter:'blur(0px)',
          duration:0.9, ease:'power3.out',
          scrollTrigger:{ trigger:el, start:'top 88%', once:true }
        }
      );
    });

    // Section headers — slide in with split character animation
    document.querySelectorAll('.section-header').forEach(el=>{
      gsap.fromTo(el,
        { opacity:0, y:35 },
        {
          opacity:1, y:0, duration:0.9, ease:'power3.out',
          scrollTrigger:{ trigger:el, start:'top 90%', once:true }
        }
      );
    });

    // Skill tags — cascade stagger
    document.querySelectorAll('.skill-group').forEach(group => {
      const tags = group.querySelectorAll('.skill-tag');
      gsap.fromTo(tags,
        { opacity:0, y:15, scale:0.9 },
        {
          opacity:1, y:0, scale:1,
          duration:0.5, ease:'power3.out',
          stagger:0.05,
          scrollTrigger:{ trigger:group, start:'top 85%', once:true }
        }
      );
    });

    // Achievement tags — cascade stagger
    document.querySelectorAll('.achieve-tags').forEach(group => {
      const tags = group.querySelectorAll('.tag');
      gsap.fromTo(tags,
        { opacity:0, scale:0.85 },
        {
          opacity:1, scale:1,
          duration:0.4, ease:'power3.out',
          stagger:0.06,
          scrollTrigger:{ trigger:group, start:'top 90%', once:true }
        }
      );
    });

    // Project card images — subtle parallax
    document.querySelectorAll('.card-image img').forEach(img => {
      gsap.fromTo(img,
        { yPercent: -5 },
        {
          yPercent: 5,
          ease:'none',
          scrollTrigger:{
            trigger: img.closest('.project-card'),
            start:'top bottom',
            end:'bottom top',
            scrub:1
          }
        }
      );
    });

    // Project cards — staggered reveal from alternating sides
    document.querySelectorAll('.project-card').forEach((card, i) => {
      const fromX = i % 2 === 0 ? -60 : 60;
      gsap.fromTo(card,
        { opacity:0, x:fromX, filter:'blur(6px)' },
        {
          opacity:1, x:0, filter:'blur(0px)',
          duration:1.0, ease:'power3.out',
          scrollTrigger:{ trigger:card, start:'top 85%', once:true }
        }
      );
    });

    // Cert cards — cascade stagger
    const certCards = document.querySelectorAll('.cert-card');
    if(certCards.length){
      gsap.fromTo(certCards,
        { opacity:0, y:30, scale:0.92, filter:'blur(4px)' },
        {
          opacity:1, y:0, scale:1, filter:'blur(0px)',
          duration:0.6, ease:'power3.out',
          stagger:0.08,
          scrollTrigger:{ trigger:certCards[0], start:'top 88%', once:true }
        }
      );
    }

    // Footer CTA — dramatic entrance
    const footerCta = document.querySelector('.footer-cta');
    if(footerCta){
      gsap.fromTo(footerCta,
        { opacity:0, y:60, filter:'blur(10px)' },
        {
          opacity:1, y:0, filter:'blur(0px)',
          duration:1.2, ease:'power3.out',
          scrollTrigger:{ trigger:footerCta, start:'top 90%', once:true }
        }
      );
    }

    // Footer bottom — fade in
    const footerBottom = document.querySelector('.footer-bottom');
    if(footerBottom){
      gsap.fromTo(footerBottom,
        { opacity:0, y:20 },
        {
          opacity:1, y:0, duration:0.8, ease:'power3.out',
          scrollTrigger:{ trigger:footerBottom, start:'top 95%', once:true }
        }
      );
    }

    // Tab buttons — stagger on scroll
    const tabBtns = document.querySelectorAll('.tab-btn');
    if(tabBtns.length){
      gsap.fromTo(tabBtns,
        { opacity:0, y:20, scale:0.92 },
        {
          opacity:1, y:0, scale:1,
          duration:0.5, ease:'power3.out',
          stagger:0.08,
          scrollTrigger:{ trigger:'.tabs-nav', start:'top 88%', once:true }
        }
      );
    }

    // Section orbs — parallax float
    document.querySelectorAll('.section-orb').forEach(orb => {
      gsap.to(orb, {
        y: -80,
        ease: 'none',
        scrollTrigger: {
          trigger: orb.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5
        }
      });
    });

    // Initialize card tilt after reveals
    initCardTilt();
  }
})();
