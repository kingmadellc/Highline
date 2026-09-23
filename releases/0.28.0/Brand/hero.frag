precision highp float;
varying vec2 vUV;
uniform sampler2D uArt,uPlate,uMasks;
uniform float uTime,uIntro;
vec4 art(vec2 p){return texture2D(uArt,clamp(p,0.0,1.0));}
vec4 plate(vec2 p){return texture2D(uPlate,clamp(p,0.0,1.0));}
vec4 masks(vec2 p){return texture2D(uMasks,clamp(p,0.0,1.0));}
// Highline start screen. The poster is the original raster: every pixel of the
// surfer, the board and the cream/red wordmark is sampled straight out of it.
// Three things move - the rider rocks on his board, gulls work the sky above the
// treeline, and a lens flare lives on the sun.
//
// p     - normalized artwork coordinate, y down.
// intro - seconds since the start screen appeared; drives the one-shot wordmark
//         reveal and then the sky filling with gulls.
// t     - the same continuous clock; the rock, the gulls and the flare read it.
//
// The water is deliberately not animated. Transported water, a foam lifecycle,
// drifting cloud and spray off the hand and rail were all built and all removed.
// The spray read as a particle burst rather than as water - a hand drag is a
// planing problem, where a thin sheet leaves the hand, its free edge thickens
// into a rim, the rim fingers, and only then does it shed droplets, and none of
// that cascade was modelled. The rest did not earn its cost.

#define ASPECT   1.776833
#define REVEAL   2.60  // the existing wordmark signature length
#define BIRDS_IN 3.10  // the sky fills once the lettering has resolved

float sat(float n){return clamp(n,0.0,1.0);}
float hash1(float n){return fract(sin(n*127.1+31.7)*43758.5453);}
float strand(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;return length(pa-ba*sat(dot(pa,ba)/dot(ba,ba)));}
float actor(vec2 p){vec3 m=masks(p).rgb;return sat(m.r+m.g);}
vec2 turn(vec2 p,float angle)
{
 vec2 d=p*vec2(ASPECT,1.0);float s=sin(angle),c=cos(angle);
 return vec2(d.x*c-d.y*s,d.x*s+d.y*c)/vec2(ASPECT,1.0);
}

// ---------------------------------------------------------------- the rock ---
// One rigid transform carries rider and board together, so anatomy, hair and
// skin texture stay exactly as painted - no warping, no colour keying. Three
// incommensurate periods (12.0s, 7.7s, 5.2s) keep it off a metronome. The pivot
// sits at his back foot, so the tail barely moves while his shoulders travel a
// few pixels, which is what trimming weight rail to rail actually looks like.
float riderBank(float t){return sin(t*.5236)*.0062+sin(t*.8130+1.9)*.0021;}
vec2 riderTrim(float t){return vec2(.0013,-.0021)*sin(t*.5236)+vec2(0.0,.0016)*sin(t*1.2170+.7);}

// ------------------------------------------------------------ entrainment ---
// Water in contact with a planing hull is carried by it. Without this the board
// rocks against a frozen waterline and the whole figure reads as a cutout laid
// on a photograph - the rock is the giveaway, not the fix. A fraction of the
// same rigid transform is applied to the water as well, strongest against the
// silhouette and gone within roughly fifty pixels of it, so the hull, the
// buried hand and the foam they are sitting in all move together.
// Sampling the authored silhouette on two rings is a cheap distance falloff;
// the mask is binary, so the ring average is what softens it.
float entrained(vec2 p)
{
 float n=actor(p)*1.6;
 n+=actor(p+vec2(.013,0.0))+actor(p-vec2(.013,0.0));
 n+=actor(p+vec2(0.0,.023))+actor(p-vec2(0.0,.023));
 n+=(actor(p+vec2(.028,0.0))+actor(p-vec2(.028,0.0)))*.6;
 n+=(actor(p+vec2(0.0,.049))+actor(p-vec2(0.0,.049)))*.6;
 return sat(n*.19);
}

// ------------------------------------------------------------------- birds ---
// Two hinged wings and a small body in an aspect-corrected local frame. The
// silhouette only darkens what is already bright, so it can never appear on the
// palms, the tower or the water.
float gull(vec2 d,float flap)
{
 d.y-=.13*flap;
 vec2 h=vec2(abs(d.x),d.y);
 vec2 elbow=vec2(.44,-.30*flap);
 vec2 tip=vec2(1.0,.17-.66*flap);
 float w=min(strand(h,vec2(.04,0.0),elbow),strand(h,elbow,tip));
 float thin=mix(.115,.030,smoothstep(.15,1.0,h.x));
 float wings=1.0-smoothstep(thin*.50,thin,w);
 float body=1.0-smoothstep(.055,.125,length(d*vec2(.62,1.45)));
 return max(wings,body);
}


vec3 poster(vec2 p,float t,float intro)
{
 float bank=riderBank(t);
 vec2 trim=riderTrim(t),pivot=vec2(.44,.68);
 vec2 riderUV=pivot+turn(p-pivot-trim,-bank);
 float riderA=actor(riderUV),stillA=actor(p);
 float word=masks(p).b;

 // The water he is riding on is carried with him, fading out with distance, so
 // the waterline and the foam stay attached to the hull. Away from the figure
 // the frame is the untouched original, and the generated clean plate fills only
 // the narrow sliver the rock still exposes behind his silhouette.
 float carry=entrained(p);
 vec2 waterUV=pivot+turn(p-pivot-trim*carry,-bank*carry);
 vec3 col=art(waterUV).rgb;
 col=mix(col,plate(p).rgb,sat(stillA-riderA));
 col=mix(col,art(riderUV).rgb,riderA);

 // --------------------------------------------------------- the living sky ---
 // Gulls work the band between the swash and the distant treeline. That strip is
 // below every column of the wordmark envelope, so a bird is never sliced by it,
 // and the brightness gate lets a palm crown or the tower occlude one naturally.
 // The band also starts clear of the breaking wave: the gate reads brightness,
 // and sunlit spray is bright enough to have carried a gull onto the face.
 if(p.y>.470 && p.y<.575 && p.x>.625)
 {
  float birds=smoothstep(BIRDS_IN,BIRDS_IN+2.1,intro);
  if(birds>.002)
  {
   // Only darken what is already bright: palms, tower and dune never gain a bird.
   float lit=smoothstep(.56,.74,dot(col,vec3(.30,.55,.15)));
   for(int birdIndex=0;birdIndex<6;birdIndex++)
   {
    float id=float(birdIndex);
    float seed=hash1(id+301.0),seed2=hash1(id+417.0);
    float far=step(2.5,id);
    float speed=mix(.0175,.0092,far)*(.80+seed*.40);
    // Spaced by index rather than by hash, so the band is never empty.
    float u=fract(t*speed+id*.1667+seed*.10);
    float x=1.07-.44*u;
    float y=mix(.4985+seed*.0135,.5215+seed*.0125,far);
    y+=mix(.0075,.0032,far)*sin(u*3.4+id*2.1)+mix(.0030,.0014,far)*sin(t*.62+id);
    float span=mix(.0126+seed2*.0036,.0060+seed2*.0018,far);
    vec2 d=(p-vec2(x,y))*vec2(ASPECT,1.0)/span;
    if(dot(d,d)<2.6)
    {
     float beat=t*mix(5.2,6.8,far)+seed2*6.2831853;
     float flap=sin(beat+.45*sin(beat));
     float vis=smoothstep(0.0,.10,u)*(1.0-smoothstep(.86,1.0,u));
     float shape=gull(d,flap)*vis*lit*birds;
     col=mix(col,col*mix(.44,.68,far)+vec3(.020,.022,.028),shape*mix(.92,.64,far));
    }
   }
  }
 }

 // ------------------------------------------------- the wordmark signature ---
 // Draw the line: a sunlit crest races along the title's red relief and long
 // swash. The lettering stays readable and resolves to the exact original raster.
 vec3 letters=art(p).rgb;
 float title=intro;
 if(title>0.0 && title<REVEAL)
 {
  vec3 clean=plate(p).rgb;
  float pigment=smoothstep(.045,.12,letters.r-letters.b);
  float changed=smoothstep(.14,.30,length(letters-clean));
  float glyph=word*pigment*changed;
  // Red relief is a reliable painted boundary, even against warm clouds and spray.
  float relief=word*smoothstep(.20,.32,letters.r-letters.g);
  float along=clamp((p.x-.44)/.54,0.0,1.0);
  float baseline=.417-.090*sin(clamp((p.x-.53)/.445,0.0,1.0)*3.14159265);
  float swash=smoothstep(baseline-.035,baseline-.013,p.y)*smoothstep(.52,.555,p.x);
  float height=clamp((baseline-p.y)/.31,0.0,1.0);
  // The line accelerates out of the H and banks upward through the smaller letters.
  float route=along+height*.12;
  float head=mix(-.16,1.28,smoothstep(.10,1.70,title));
  float crest=exp(-pow((route-head)/.065,2.0));
  float wake=exp(-pow((route-head+.105)/.15,2.0));
  float entrance=smoothstep(0.0,.18,title);
  // Brief ivory edge and coral wake resemble a board's bright rail cutting a line.
  vec3 edge=vec3(1.0,.90,.69);
  letters=mix(letters,mix(art(p).rgb,vec3(1.0,.46,.26),wake*.38),relief*entrance);
  letters=mix(letters,edge,relief*crest*.92*entrance);
  // A second, quiet glint completes the underline after the lettering has resolved.
  float sun=mix(-.12,1.22,smoothstep(1.55,2.40,title));
  float sheen=exp(-pow((along+height*.10-sun)/.045,2.0));
  float finish=sin(smoothstep(1.55,REVEAL,title)*3.14159265);
  letters+=vec3(.065,.045,.025)*sheen*finish*glyph*(.25+.75*swash);
 }
 // The complete wordmark envelope and its antialiased edges always select the
 // original source sample, so nothing in the scene can touch a letter.
 return word>.001?letters:col;
}

// ------------------------------------------------------------- lens flare ---
// A flare happens in the lens, not in the scene, so it composites over the
// finished frame - lettering included. That is exactly what keeps it off the
// wordmark envelope: applied uniformly, it never has an edge to step along.
// The afternoon sun sits at the top right of the original plate.
float flareHash(vec2 p){return fract(sin(p.x*133.7+p.y*713.1)*43758.5453);}
vec3 flare(vec3 col,vec2 p,float t)
{
 vec2 sun=vec2(.945,.055);
 vec2 d=(p-sun)*vec2(ASPECT,1.0);
 float r=length(d);
 // Scintillation: the reason a still poster still reads as a live camera.
 float live=.84+.11*sin(t*.57)+.05*sin(t*1.83+1.1);

 // Disc bloom, then a broad veiling glare that lifts the corner.
 col+=vec3(.090,.066,.034)*exp(-r*r*13.0)*live;
 col+=vec3(.042,.034,.022)*exp(-r*r*1.25)*live;

 // Anamorphic streak: wide across, tight up and down.
 col+=vec3(.062,.070,.088)*exp(-d.y*d.y*1100.0)*exp(-d.x*d.x*2.2)*live;

 // Six diffraction spikes. cos(3a) from the direction cosine keeps this free of
 // atan, which is spelled differently in the two shading languages.
 float c=d.x/max(r,1e-5);
 col+=vec3(.050,.044,.032)*pow(abs(4.0*c*c*c-3.0*c),16.0)*exp(-r*r*34.0)*live;

 // Ghosts march along the axis from the sun through the frame centre.
 vec2 axis=(vec2(.5,.5)-sun)*vec2(ASPECT,1.0);
 for(int i=1;i<=4;i++)
 {
  float gr=length(d-axis*(float(i)*.47));
  float size=.050+.028*float(i);
  float ring=(1.0-smoothstep(size*.52,size,gr))*(.30+.70*smoothstep(size*.30,size*.75,gr));
  col+=mix(vec3(.017,.024,.034),vec3(.030,.023,.014),mod(float(i),2.0))*ring*live;
 }
 // One bit of dither: the veil is a gentle gradient over a large area of flat
 // sky, which is where eight-bit banding shows.
 return col+(flareHash(p)-.5)*(1.0/255.0);
}

vec3 hero(vec2 p,float t,float intro){return flare(poster(p,t,intro),p,t);}

void main(){gl_FragColor=vec4(hero(vUV,uTime,uIntro),1.0);}
