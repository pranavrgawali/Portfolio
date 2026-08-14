/* ================================================
   INTERACTIVE MESH GRADIENT BACKGROUND v3
   Stronger cursor reaction, flowing organic shapes
   ================================================ */
(function(){
  'use strict';
  const c = document.getElementById('bgCanvas');
  if(!c) return;

  const r = new THREE.WebGLRenderer({canvas:c,alpha:true,antialias:false});
  r.setSize(innerWidth,innerHeight);
  r.setPixelRatio(Math.min(devicePixelRatio,1.5));

  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1,1,1,-1,0,1);

  const mouse = {x:.5,y:.5,tx:.5,ty:.5};
  let scroll = 0;

  document.addEventListener('mousemove',e=>{
    mouse.tx = e.clientX/innerWidth;
    mouse.ty = 1 - e.clientY/innerHeight;
  });
  addEventListener('scroll',()=>{
    scroll = scrollY/(document.body.scrollHeight-innerHeight||1);
  });

  const geo = new THREE.PlaneGeometry(2,2);
  const mat = new THREE.ShaderMaterial({
    uniforms:{
      uTime:{value:0},
      uMouse:{value:new THREE.Vector2(.5,.5)},
      uScroll:{value:0},
      uRes:{value:new THREE.Vector2(innerWidth,innerHeight)}
    },
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.);}`,
    fragmentShader:`
      precision mediump float;
      varying vec2 vUv;
      uniform float uTime,uScroll;
      uniform vec2 uMouse,uRes;

      vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
      vec2 mod289(vec2 x){return x-floor(x*(1./289.))*289.;}
      vec3 permute(vec3 x){return mod289(((x*34.)+1.)*x);}

      float snoise(vec2 v){
        const vec4 C=vec4(.211324865,.366025403,-.577350269,.024390243);
        vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);
        vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
        vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);
        vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
        vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
        m=m*m;m=m*m;
        vec3 x=2.*fract(p*C.www)-1.;vec3 h=abs(x)-.5;
        vec3 ox=floor(x+.5);vec3 a0=x-ox;
        m*=1.79284291-.85373472*(a0*a0+h*h);
        vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;
        return 130.*dot(m,g);
      }

      void main(){
        vec2 uv=vUv;
        float asp=uRes.x/uRes.y;
        vec2 p=uv*vec2(asp,1.);

        // Mouse distortion — STRONG
        vec2 mOff=(uMouse-vec2(.5))*1.2;
        float mDist=length(uv-uMouse);
        float mPull=smoothstep(.6,0.,mDist)*.4;

        float t=uTime*.12;
        float n1=snoise(p*1.2+vec2(t,t*.6)+mOff*.6+vec2(mPull));
        float n2=snoise(p*2.3+vec2(-t*.4,t*.3)-mOff*.4);
        float n3=snoise(p*3.8+vec2(t*.25,-t*.5)+mOff*1.2);
        float n4=snoise(p*5.+vec2(mPull*2.,t*.15));

        float n=n1*.45+n2*.25+n3*.2+n4*.1;
        float blend=n*.5+.5;

        // Colors shifting with scroll
        vec3 purple=vec3(.486,.416,1.);
        vec3 cyan=vec3(0.,.898,1.);
        vec3 pink=vec3(1.,.302,.553);
        vec3 dark=vec3(.043,.043,.071);

        float sc=uScroll*3.14159;
        vec3 c1=mix(purple,cyan,sin(sc)*.5+.5);
        vec3 c2=mix(cyan,pink,cos(sc*.7)*.5+.5);

        vec3 col=mix(c1,c2,smoothstep(.3,.7,blend));
        col=mix(dark,col,.14+n*.1);

        // Mouse glow — visible spotlight effect
        float glow=smoothstep(.45,0.,mDist)*.1;
        vec3 glowCol=mix(purple,cyan,.5);
        col+=glowCol*glow;

        // Subtle radial fade
        float vig=1.-smoothstep(.25,1.1,length(uv-.5));
        col*=.7+vig*.3;

        gl_FragColor=vec4(col,1.);
      }
    `
  });
  scene.add(new THREE.Mesh(geo,mat));

  // Floating particles
  const N=250;
  const pGeo=new THREE.BufferGeometry();
  const pos=new Float32Array(N*3);
  const sz=new Float32Array(N);
  const spd=[];
  for(let i=0;i<N;i++){
    pos[i*3]=(Math.random()-.5)*2;
    pos[i*3+1]=(Math.random()-.5)*2;
    pos[i*3+2]=0;
    sz[i]=Math.random()*3+1;
    spd.push({x:(Math.random()-.5)*.0005,y:(Math.random()-.5)*.0005});
  }
  pGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  pGeo.setAttribute('size',new THREE.BufferAttribute(sz,1));
  const pMat=new THREE.ShaderMaterial({
    uniforms:{uPR:{value:r.getPixelRatio()}},
    vertexShader:`attribute float size;uniform float uPR;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vA=smoothstep(1.,.15,length(position.xy))*.5;gl_PointSize=size*uPR*1.5;gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`varying float vA;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;float a=smoothstep(.5,0.,d)*vA;gl_FragColor=vec4(.486,.416,1.,a);}`,
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending
  });
  scene.add(new THREE.Points(pGeo,pMat));

  const clock=new THREE.Clock();
  function render(){
    requestAnimationFrame(render);
    const t=clock.getElapsedTime();
    mouse.x+=(mouse.tx-mouse.x)*.06;
    mouse.y+=(mouse.ty-mouse.y)*.06;
    mat.uniforms.uTime.value=t;
    mat.uniforms.uMouse.value.set(mouse.x,mouse.y);
    mat.uniforms.uScroll.value=scroll;

    const p=pGeo.attributes.position.array;
    for(let i=0;i<N;i++){
      const i3=i*3;
      p[i3]+=spd[i].x;p[i3+1]+=spd[i].y;
      if(p[i3]>1)p[i3]=-1;if(p[i3]<-1)p[i3]=1;
      if(p[i3+1]>1)p[i3+1]=-1;if(p[i3+1]<-1)p[i3+1]=1;
      const dx=p[i3]-(mouse.x*2-1),dy=p[i3+1]-(mouse.y*2-1);
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<.35){const f=(.35-d)*.008;p[i3]+=dx/d*f;p[i3+1]+=dy/d*f;}
    }
    pGeo.attributes.position.needsUpdate=true;
    r.render(scene,cam);
  }
  render();

  addEventListener('resize',()=>{
    r.setSize(innerWidth,innerHeight);
    mat.uniforms.uRes.value.set(innerWidth,innerHeight);
  });
})();
