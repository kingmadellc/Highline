// A one-shot highlight along the wordmark relief and swash, then a live lens
// flare on the sun. The scene itself never moves; the poster is the original art.
(() => {
 const holder=document.getElementById('loading'),canvas=document.getElementById('hero-motion');
 if(!holder||!canvas)return;
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const REVEAL=2.6;
 let gl,program,uTime,uIntro,raf=0,nextFrame=0,start=performance.now(),time=0,ready=false,disposed=false,manual=null,frames=0;
 // The clock measures time the start screen has actually been on screen, so a
 // page opened in a background tab still gets its reveal when it is looked at.
 let pausedAt=0;
 const textures=[];
 const reduced=()=>preference.matches||!!window.surfState?.reducedMotion;
 const usable=()=>ready&&!disposed&&!document.hidden&&!holder.hidden&&!reduced();
 // The reveal wants smooth frames; the living water then runs at the same 30 Hz
 // cap the photographic menu motion has always used.
 const hertz=t=>t<REVEAL?60:30;
 function stop(){cancelAnimationFrame(raf);raf=0;}
 function hold(){holder.classList.remove('motion-ready');if(!pausedAt)pausedAt=performance.now();}
 function resize(){const r=holder.getBoundingClientRect(),ratio=1672/941,w=Math.min(r.width,r.height*ratio),pixels=Math.min(1672,w*Math.min(devicePixelRatio||1,2));canvas.width=Math.max(1,Math.round(pixels));canvas.height=Math.max(1,Math.round(pixels/ratio));canvas.style.width=w+'px';canvas.style.height=w/ratio+'px';if(gl)gl.viewport(0,0,canvas.width,canvas.height);}
 function draw(t){if(!ready||disposed)return;time=t;gl.useProgram(program);gl.uniform1f(uTime,t);gl.uniform1f(uIntro,t);gl.drawArrays(gl.TRIANGLES,0,6);frames++;}
 function tick(now){raf=0;if(!usable()){hold();return;}holder.classList.add('motion-ready');if(now>=nextFrame){draw(manual??(now-start)/1000);const step=1000/hertz(time);nextFrame+=step;if(nextFrame<=now)nextFrame=now+step;}raf=requestAnimationFrame(tick);}
 function sync(){stop();if(!usable()){hold();return;}if(pausedAt){const held=performance.now()-pausedAt;start+=held;nextFrame+=held;pausedAt=0;}raf=requestAnimationFrame(tick);}
 function dispose(){stop();disposed=true;holder.classList.remove('motion-ready');pausedAt=0;if(gl){textures.forEach(t=>gl.deleteTexture(t));if(program)gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext();}}
 window.highlineHero={get time(){return time;},get reduced(){return reduced();},state:()=>({ready,active:usable(),disposed,time,frames,width:canvas.width,height:canvas.height,kind:'rock-gulls-reveal-and-flare',reveal:REVEAL,hertz:hertz(time),paused:!!pausedAt,settled:time>=REVEAL}),seek(t){manual=t;draw(t);sync();},resume(){manual=null;start=performance.now()-time*1000;pausedAt=0;sync();},dispose};
 preference.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);window.addEventListener('resize',resize);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();ready=false;stop();holder.classList.remove('motion-ready');});
 async function initialize(){
  gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'low-power',preserveDrawingBuffer:true});if(!gl)return;
  // Every sampler the shader declares must be bound. An unbound sampler silently
  // reads texture unit 0 - the key art - which turns the flow field into image
  // brightness and quietly drags the whole distant beach around.
  const sources=['highline.png','highline-plate.png','hero-masks.png'];
  const samplers=['uArt','uPlate','uMasks'];
  const [fragment,...images]=await Promise.all([fetch('Brand/hero.frag').then(r=>{if(!r.ok)throw Error('Motion shader unavailable');return r.text();}),...sources.map(src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src='Brand/'+src;}))]);
  if(disposed||gl.isContextLost())return;
  const compile=(kind,source)=>{const s=gl.createShader(kind);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
  const vertex=compile(gl.VERTEX_SHADER,'attribute vec2 position;varying vec2 vUV;void main(){gl_Position=vec4(position,0.,1.);vUV=vec2(position.x*.5+.5,.5-position.y*.5);}');
  const frag=compile(gl.FRAGMENT_SHADER,fragment);program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,frag);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.deleteShader(vertex);gl.deleteShader(frag);gl.useProgram(program);uTime=gl.getUniformLocation(program,'uTime');uIntro=gl.getUniformLocation(program,'uIntro');
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  images.forEach((i,n)=>{const texture=gl.createTexture();textures.push(texture);gl.activeTexture(gl.TEXTURE0+n);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,i);const slot=gl.getUniformLocation(program,samplers[n]);if(slot===null)throw Error('Shader is missing sampler '+samplers[n]);gl.uniform1i(slot,n);});
  ready=true;start=performance.now();resize();sync();
 }
 // A missing/unsupported effect leaves the original, readable poster and start button intact.
 initialize().catch(error=>{window.highlineHeroError=String(error);dispose();});
})();
