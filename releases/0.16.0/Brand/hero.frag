precision highp float;
varying vec2 vUV;
uniform sampler2D uArt,uPlate,uMasks,uSpray,uFlow,uSplash;
uniform float uTime,uIntro;
vec4 art(vec2 p){return texture2D(uArt,clamp(p,0.0,1.0));}
vec4 plate(vec2 p){return texture2D(uPlate,clamp(p,0.0,1.0));}
vec4 masks(vec2 p){return texture2D(uMasks,clamp(p,0.0,1.0));}
vec4 spray(vec2 p){return texture2D(uSpray,p);}
vec4 flow(vec2 p){return texture2D(uFlow,p);}
vec4 splash(vec2 p){return texture2D(uSplash,p);}
// Shared photographic artwork motion, normalized coordinates with y down.
float sat(float n){return clamp(n,0.0,1.0);}
float hash1(float n){return fract(sin(n*127.1+31.7)*43758.5453);}
float pressure(float t){float c=fract(t/12.0)*12.0;return smoothstep(.7,2.4,c)*(1.0-smoothstep(4.0,6.4,c));}
float actor(vec2 p){vec3 m=masks(p).rgb;return sat(m.r+m.g);}
vec2 turn(vec2 p,float angle)
{
 vec2 d=p*vec2(1.776833,1.0);float s=sin(angle),c=cos(angle);
 return vec2(d.x*c-d.y*s,d.x*s+d.y*c)/vec2(1.776833,1.0);
}
// Resolve emission positions at birth, so released spray no longer follows the hand.
vec2 supported(vec2 p,float t)
{
 float phase=t*.523598776;
 return vec2(.44,.68)+turn(p-vec2(.44,.68),sin(phase)*.006+sin(phase*2.0)*.0015)+vec2(.0010,-.0016)*sin(phase);
}
vec4 fragment(vec2 p,vec2 center,vec2 tangent,vec2 extent,float cell,float sheet)
{
 vec2 d=(p-center)*vec2(1.776833,1.0);
 vec2 uv=vec2(dot(d,tangent),-d.x*tangent.y+d.y*tangent.x)/extent+.5;
 if(uv.x<=0.0 || uv.x>=1.0 || uv.y<=0.0 || uv.y>=1.0)return vec4(0.0,0.0,0.0,0.0);
 vec2 atlas=(uv+vec2(mod(cell,2.0),floor(cell/2.0)))*.5;
 if(sheet>.5)return splash(atlas);
 return spray(atlas);
}
// Drain thin films first so old foam opens into small bright bubble islands.
float foamCoverage(vec4 water,float drain)
{
 float light=dot(water.rgb,vec3(.25,.55,.20));
 float bubbles=smoothstep(.48+drain*.14,.90,light);
 float film=water.a*bubbles;
 return film*smoothstep(.02+drain*.28,.10+drain*.52,film);
}
// Authored crest contour in the original camera, shared by birth and falling foam.
float crestX(float y){return .332+.12*y+.275*y*y;}
vec3 hero(vec2 p,float t,float intro)
{
 float phase=t*.523598776;
 // One supported board/figure transform preserves anatomy, hair and skin texture.
 float bank=sin(phase)*.006+sin(phase*2.0)*.0015;
 vec2 trim=vec2(.0010,-.0016)*sin(phase);
 vec2 pivot=vec2(.44,.68);
 vec2 riderUV=pivot+turn(p-pivot-trim,-bank);
 float riderA=actor(riderUV),stillA=actor(p);
 // Retain the original photo everywhere except the narrow newly exposed silhouette.
 // A padded stationary region prevents water flow from sampling skin or lettering.
 float guard=stillA;
 guard=max(guard,actor(p+vec2(.014,0.0)));
 guard=max(guard,actor(p-vec2(.014,0.0)));
 guard=max(guard,actor(p+vec2(0.0,.020)));
 guard=max(guard,actor(p-vec2(0.0,.020)));
 // Authored streamlines follow the photographed curl, falling crest and rail wash.
 // Midpoint tracing bends the transport with those curves, rather than sliding a rectangle.
 vec4 field=flow(p);
 float wet=field.b*(1.0-guard)*(1.0-masks(p).b);
 float a=fract(t/3.2),b=fract(t/3.2+.5),blend=1.0-abs(a*2.0-1.0);
 vec2 v=(field.rg-.5)*.12;
 vec2 va=(flow(p-v*(a-.5)*.5).rg-.5)*.12;
 vec2 vb=(flow(p-v*(b-.5)*.5).rg-.5)*.12;
 vec2 uvA=p-va*(a-.5)*wet,uvB=p-vb*(b-.5)*wet;
 // Guard the sampled locations as well as the destination: foam never copies a limb.
 uvA=mix(uvA,p,actor(uvA));uvB=mix(uvB,p,actor(uvB));
 vec3 col=mix(art(uvB).rgb,art(uvA).rgb,blend);
 col=mix(col,plate(p).rgb,sat(stillA-riderA));
 col=mix(col,art(riderUV).rgb,riderA);
 // A connected crest-to-sea lifecycle: spilling froth falls into the trough,
 // then turns into a flat, expanding surface wash that drains and breaks apart.
 float crestBand=p.x-(.335+p.y*.29);
 float foamOpen=(1.0-riderA)*(1.0-step(.001,masks(p).b));
 if(foamOpen>.001 && ((p.y<.84 && abs(crestBand)<.14) || (p.y>.64 && p.x>.36)))
 {
  for(int crestIndex=0;crestIndex<20;crestIndex++)
  {
   float id=float(crestIndex)+160.0,seed=hash1(id);
   float life=12.0/(2.0+floor(hash1(id+1.0)*2.0));
   float age=fract(t/life+seed)*life;
   float lip=hash1(id+2.0),rootY=-.045+lip*.51;
   float offset=(hash1(id+3.0)-.5)*.036;
   float fallSpeed=.19+seed*.055;
   float gravity=.16,waterline=.680+seed*.050;
   float hit=(sqrt(fallSpeed*fallSpeed+2.0*gravity*(waterline-rootY))-fallSpeed)/gravity;
   float falling=min(age,hit),washing=max(age-hit,0.0);
   float y=rootY+fallSpeed*falling+.5*gravity*falling*falling;
   vec2 center=vec2(crestX(y)+offset,y);
   vec2 current=vec2(.055+seed*.040,.022+seed*.012);
   float travel=(1.0-exp(-washing*.28))/.28;
   center+=current*travel;
   float settled=smoothstep(0.0,.50,washing);
   vec2 airborne=normalize(vec2((.12+.55*y)*1.776833,1.0));
   vec2 tangent=normalize(mix(airborne,normalize(current*vec2(1.776833,1.0)),settled));
   vec2 extent=mix(vec2(.105+falling*.065,.080+seed*.030),vec2(.19+washing*.065,.070+washing*.012),settled);
   vec4 water=fragment(p,center,tangent,extent,2.0+mod(float(crestIndex),2.0),1.0);
   float drain=sat(washing/max(.5,life-hit));
   float fade=smoothstep(0.0,.17,age)*(1.0-smoothstep(.55,1.0,drain));
   float alpha=foamCoverage(water,drain)*fade*(.80-.16*settled)*(1.0-riderA);
   vec3 whitewater=water.rgb*.72+vec3(.26,.28,.25);
   col=mix(col,max(col,whitewater),alpha);
  }
 }
 // The impact roll keeps replenishing a broad base of whitewater. The wash
 // travels seaward, stretching into thin lace before individual patches vanish.
 if(foamOpen>.001 && p.y>.63 && p.x>.31)
 {
  for(int washIndex=0;washIndex<14;washIndex++)
  {
   float id=float(washIndex)+220.0,seed=hash1(id),life=12.0/(3.0+floor(hash1(id+1.0)*2.0));
   float age=fract(t/life+seed)*life,n=age/life,along=hash1(id+3.0);
   vec2 origin=vec2(.52+along*.30,.700+along*.040);
   vec2 current=vec2(.043+seed*.041,.020+seed*.012);
   float travel=(1.0-exp(-age*.30))/.30;
   vec2 center=origin+current*travel;
   vec2 extent=vec2(.19+age*.055,.085+age*.012);
   vec4 water=fragment(p,center,normalize(vec2(1.0,.24+along*.10)),extent,2.0+mod(float(washIndex),2.0),1.0);
   float fade=smoothstep(0.0,.20,age)*(1.0-smoothstep(.48,1.0,n));
   float alpha=foamCoverage(water,n)*fade*.88*(1.0-riderA);
   vec3 whitewater=water.rgb*.72+vec3(.26,.28,.25);
   col=mix(col,max(col,whitewater),alpha);
  }
 }
 // A broad, three-dimensional fan: upward sheets, lateral beads and returning drops.
 // Foreground fragments cross the contact hand; farther fragments pass behind the arm.
 if(p.x<.29 && p.y>.20 && p.y<.79)
 {
  // Short-lived torn sheets expand from the contact before releasing the fine spray.
  for(int sheetIndex=0;sheetIndex<4;sheetIndex++)
  {
   float id=float(sheetIndex),age=fract(t/(12.0/13.0)+id*.25)*(12.0/13.0),n=age/(12.0/13.0);
   float load=.48+.52*pressure(t-age);
   float angle=-.75+id*.48;
   vec2 across=vec2(cos(angle),sin(angle));
   vec2 up=vec2(across.y,-across.x);
   vec2 extent=vec2(.10+n*.20,.075+n*.16);
   vec2 center=supported(vec2(.088,.476),t-age);
   center+=(up*extent.y*.43+vec2(-.008*age,.065*age*age))/vec2(1.776833,1.0);
   vec4 water=fragment(p,center,across,extent,mod(id,2.0),1.0);
   float fade=smoothstep(0.0,.12,n)*(1.0-smoothstep(.28,1.0,n));
   col=mix(col,water.rgb,water.a*fade*load*.60*(1.0-riderA));
  }
  for(int j=0;j<64;j++)
  {
   float id=float(j),seed=hash1(id+1.0);
   float life=12.0/(10.0+floor(hash1(id+40.0)*7.0));
   float age=fract(t/life+seed)*life,born=t-age,load=.42+.58*pressure(born);
   float angle=hash1(id+3.0)*6.2831853;
   float speed=(.095+hash1(id+7.0)*.21)*(.72+load*.28);
   vec2 launch=vec2(cos(angle)*speed/1.776833-.019,sin(angle)*speed-.078);
   vec2 center=supported(vec2(.088,.476),born)+launch*age+vec2(-.009,.19)*age*age;
   center+=vec2(hash1(id+11.0)-.5,hash1(id+12.0)-.5)*.007;
   vec2 tangent=normalize((launch+vec2(-.018,.38)*age)*vec2(1.776833,1.0));
   float size=.0035+hash1(id+18.0)*.007;
   float cell=mod(id,4.0);
   vec4 water=fragment(p,center,tangent,vec2(size*3.5,size*2.3),cell,0.0);
   float fade=smoothstep(0.0,.035,age)*(1.0-smoothstep(life*.48,life,age));
   float depth=mix(1.0-riderA,1.0,step(.74,hash1(id+24.0)));
   col=mix(col,water.rgb,water.a*fade*load*.84*depth);
  }
 }
 // New rail foam sheds along the board edge and flattens into the existing wash.
 // Every clump spreads, breaks up and fades as it travels aft and away from the rail.
 if(p.y>.62 && p.x>.09 && p.x<.87)
 {
  for(int j=0;j<28;j++)
  {
   float id=float(j)+90.0,seed=hash1(id);
   float life=12.0/(5.0+floor(hash1(id+1.0)*4.0));
   float age=fract(t/life+seed)*life,n=age/life;
   float rail=hash1(id+3.0);
   vec2 origin=vec2(.352+rail*.422,.685+rail*.198+sin(rail*3.14159)*.014);
   vec2 center=supported(origin,t-age)+vec2(-.043-.025*seed,.029+.012*seed)*age;
   center+=vec2(-.008,.006)*age*age;
   float spread=(.019+seed*.017)*(1.0+n*1.8);
   vec4 water=fragment(p,center,normalize(vec2(-1.0,.27)),vec2(spread*3.8,spread*1.3),2.0+mod(float(j),2.0),1.0);
   float fade=smoothstep(0.0,.10,age)*(1.0-smoothstep(.34,1.0,n));
   vec3 foam=mix(water.rgb,vec3(.89,.96,.91),.30);
   col=mix(col,foam,water.a*fade*.62*(1.0-riderA));
  }
 }
 // Pin the complete wordmark and antialiased edges to the original source sample.
 // A final selection keeps it independent of every animation and avoids early-return shader warnings.
 return masks(p).b>.001?art(p).rgb:col;
}

void main(){gl_FragColor=vec4(hero(vUV,uTime,uIntro),1.0);}
