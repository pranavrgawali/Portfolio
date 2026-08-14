/* ================================================
   SOUND ENGINE — Web Audio API Synthesized Sounds
   Muted by default, user opt-in via toggle
   ================================================ */
(function(){
  'use strict';

  let audioCtx = null;
  let isEnabled = false;
  let masterGain = null;
  let ambientOsc = null;
  let ambientGain = null;

  const toggleBtn = document.getElementById('soundToggle');
  if(!toggleBtn) return;

  function initAudio(){
    if(audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.35;
    masterGain.connect(audioCtx.destination);
  }

  /* ---- Ambient Pad ---- */
  function startAmbient(){
    if(!audioCtx || ambientOsc) return;
    
    ambientGain = audioCtx.createGain();
    ambientGain.gain.value = 0;
    ambientGain.connect(masterGain);

    // Two detuned oscillators for a warm pad
    const osc1 = audioCtx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 85;
    
    const osc2 = audioCtx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 127.5; // Perfect fifth

    const osc3 = audioCtx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.value = 170;
    osc3.detune.value = 5;

    // Filter for warmth
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;
    filter.Q.value = 1;

    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(filter);
    filter.connect(ambientGain);

    osc1.start();
    osc2.start();
    osc3.start();

    // Fade in
    ambientGain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 2);

    ambientOsc = { osc1, osc2, osc3, filter };

    // Gentle LFO on filter
    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15;
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 80;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    ambientOsc.lfo = lfo;
    ambientOsc.lfoGain = lfoGain;
  }

  function stopAmbient(){
    if(!ambientOsc || !audioCtx) return;
    const now = audioCtx.currentTime;
    ambientGain.gain.linearRampToValueAtTime(0, now + 0.5);
    setTimeout(() => {
      try {
        ambientOsc.osc1.stop();
        ambientOsc.osc2.stop();
        ambientOsc.osc3.stop();
        ambientOsc.lfo.stop();
      } catch(e){}
      ambientOsc = null;
    }, 600);
  }

  /* ---- Hover Sound — Soft Click ---- */
  function playHover(){
    if(!audioCtx || !isEnabled) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    
    osc.type = 'sine';
    osc.frequency.value = 2800 + Math.random() * 600;
    
    filter.type = 'bandpass';
    filter.frequency.value = 3000;
    filter.Q.value = 2;

    gain.gain.value = 0;
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    
    const now = audioCtx.currentTime;
    gain.gain.linearRampToValueAtTime(0.08, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.06);
    
    osc.start(now);
    osc.stop(now + 0.1);
  }

  /* ---- Click Sound — Deeper ---- */
  function playClick(){
    if(!audioCtx || !isEnabled) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.value = 800;
    
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(masterGain);
    
    const now = audioCtx.currentTime;
    gain.gain.linearRampToValueAtTime(0.12, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
    
    osc.start(now);
    osc.stop(now + 0.15);
  }

  /* ---- Section Chime ---- */
  function playSectionChime(){
    if(!audioCtx || !isEnabled) return;
    
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 — major chord
    const now = audioCtx.currentTime;

    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      filter.type = 'lowpass';
      filter.frequency.value = 2000;
      
      gain.gain.value = 0;
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      
      const t = now + i * 0.06;
      gain.gain.linearRampToValueAtTime(0.06, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      
      osc.start(t);
      osc.stop(t + 0.9);
    });
  }

  /* ---- Toggle Logic ---- */
  function enable(){
    initAudio();
    if(audioCtx.state === 'suspended') audioCtx.resume();
    isEnabled = true;
    startAmbient();
    toggleBtn.classList.add('sound-on');
    toggleBtn.setAttribute('aria-label', 'Mute sounds');
  }

  function disable(){
    isEnabled = false;
    stopAmbient();
    toggleBtn.classList.remove('sound-on');
    toggleBtn.setAttribute('aria-label', 'Enable sounds');
  }

  toggleBtn.addEventListener('click', () => {
    if(isEnabled) disable();
    else enable();
  });

  /* ---- Attach Hover Sounds to Interactive Elements ---- */
  function attachSounds(){
    // Hover sounds on buttons, links, cards
    const hoverTargets = document.querySelectorAll(
      '.btn, .nav-link, .card-btn, .tab-btn, .social-icon, .sidebar-icon, .cert-link, .skill-tag, .tag, .footer-social, .footer-cta, .back-to-top'
    );
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', playHover);
    });

    // Click sounds on buttons
    const clickTargets = document.querySelectorAll('.btn, .tab-btn, .card-btn, .cert-link, .back-to-top');
    clickTargets.forEach(el => {
      el.addEventListener('click', playClick);
    });

    // Section chimes on scroll
    const sections = document.querySelectorAll('#skills, #projects, #achievements, #about, #contact');
    const chimeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting && isEnabled){
          playSectionChime();
        }
      });
    }, { threshold: 0.15 });
    
    sections.forEach(sec => chimeObserver.observe(sec));
  }

  // Wait for DOM ready then attach
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', attachSounds);
  } else {
    attachSounds();
  }

})();
