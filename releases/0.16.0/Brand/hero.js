// One 30 Hz artwork pass. All movement is authored in hero.frag; no game input is synthesized.
(() => {
 const holder=document.getElementById('loading'),canvas=document.getElementById('hero-motion');
 if(!holder||!canvas)return;
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 let gl,program,raf=0,nextFrame=0,start=performance.now(),time=0,ready=false,disposed=false,manual=null,frames=0;
 const textures=[];
 const reduced=()=>preference.matches||!!window.surfState?.reducedMotion;
 const usable=()=>ready&&!disposed&&!document.hidden&&!holder.hidden&&!reduced();
 function stop(){cancelAnimationFrame(raf);raf=0;}
 function resize(){const r=holder.getBoundingClientRect(),ratio=1672/941,w=Math.min(r.width,r.height*ratio),pixels=Math.min(1672,w*Math.min(devicePixelRatio||1,2));canvas.width=Math.max(1,Math.round(pixels));canvas.height=Math.max(1,Math.round(pixels/ratio));canvas.style.width=w+'px';canvas.style.height=w/ratio+'px';if(gl)gl.viewport(0,0,canvas.width,canvas.height);}
 function draw(t){if(!ready||disposed)return;time=t;gl.useProgram(program);gl.uniform1f(gl.getUniformLocation(program,'uTime'),t);gl.uniform1f(gl.getUniformLocation(program,'uIntro'),t);gl.drawArrays(gl.TRIANGLES,0,6);frames++;}
 function tick(now){raf=0;if(!usable()){holder.classList.remove('motion-ready');return;}holder.classList.add('motion-ready');if(now>=nextFrame){draw(manual??(now-start)/1000);nextFrame+=1000/30;if(nextFrame<=now)nextFrame=now+1000/30;}raf=requestAnimationFrame(tick);}
 function sync(){stop();if(usable())raf=requestAnimationFrame(tick);else holder.classList.remove('motion-ready');}
 function dispose(){stop();disposed=true;holder.classList.remove('motion-ready');if(gl){textures.forEach(t=>gl.deleteTexture(t));if(program)gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext();}}
 window.highlineHero={get time(){return time;},get reduced(){return reduced();},state:()=>({ready,active:usable(),disposed,time,frames,width:canvas.width,height:canvas.height}),seek(t){manual=t;draw(t);},resume(){manual=null;start=performance.now()-time*1000;sync();},dispose};
 preference.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);window.addEventListener('resize',resize);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();ready=false;stop();holder.classList.remove('motion-ready');});
 async function initialize(){
  gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'low-power',preserveDrawingBuffer:true});if(!gl)return;
  const [fragment,...images]=await Promise.all([fetch('Brand/hero.frag').then(r=>{if(!r.ok)throw Error('Motion shader unavailable');return r.text();}),...['highline.png','highline-plate.png','hero-masks.png','water-spray.png','water-flow.png','water-splash-v15.png'].map(src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src='Brand/'+src;}))]);
  if(disposed||gl.isContextLost())return;
  const compile=(kind,source)=>{const s=gl.createShader(kind);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
  const vertex=compile(gl.VERTEX_SHADER,'attribute vec2 position;varying vec2 vUV;void main(){gl_Position=vec4(position,0.,1.);vUV=vec2(position.x*.5+.5,.5-position.y*.5);}');
  const frag=compile(gl.FRAGMENT_SHADER,fragment);program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,frag);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.deleteShader(vertex);gl.deleteShader(frag);gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  images.forEach((i,n)=>{const texture=gl.createTexture();textures.push(texture);gl.activeTexture(gl.TEXTURE0+n);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,i);gl.uniform1i(gl.getUniformLocation(program,['uArt','uPlate','uMasks','uSpray','uFlow','uSplash'][n]),n);});
  ready=true;start=performance.now();resize();sync();
 }
 // A missing/unsupported effect leaves the original, readable poster and start button intact.
 initialize().catch(error=>{window.highlineHeroError=String(error);dispose();});
})();
