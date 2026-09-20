precision highp float;
varying vec2 vUV;
uniform sampler2D uArt,uPlate,uMasks;
uniform float uTime,uIntro;
vec4 art(vec2 p){return texture2D(uArt,clamp(p,0.0,1.0));}
vec4 plate(vec2 p){return texture2D(uPlate,clamp(p,0.0,1.0));}
vec4 masks(vec2 p){return texture2D(uMasks,clamp(p,0.0,1.0));}
// Draw the line: a sunlit crest races along the title's red relief and long swash.
// The original lettering stays readable; the scene and final raster stay untouched.
vec3 hero(vec2 p,float t,float intro)
{
 vec3 original=art(p).rgb;
 if(intro>=2.6)return original;
 vec3 clean=plate(p).rgb;
 float pigment=smoothstep(.045,.12,original.r-original.b);
 float changed=smoothstep(.14,.30,length(original-clean));
 float glyph=masks(p).b*pigment*changed;
 // Red relief is a reliable painted boundary, even against warm clouds and spray.
 float relief=masks(p).b*smoothstep(.20,.32,original.r-original.g);
 float along=clamp((p.x-.44)/.54,0.0,1.0);
 float baseline=.417-.090*sin(clamp((p.x-.53)/.445,0.0,1.0)*3.14159265);
 float swash=smoothstep(baseline-.035,baseline-.013,p.y)*smoothstep(.52,.555,p.x);
 float height=clamp((baseline-p.y)/.31,0.0,1.0);
 // The line accelerates out of the H and banks upward through the smaller letters.
 float route=along+height*.12;
 float head=mix(-.16,1.28,smoothstep(.10,1.70,intro));
 float crest=exp(-pow((route-head)/.065,2.0));
 float wake=exp(-pow((route-head+.105)/.15,2.0));
 float entrance=smoothstep(0.0,.18,intro);
 vec3 paint=original;
 // Brief ivory edge and coral wake resemble a board's bright rail cutting a line.
 vec3 edge=vec3(1.0,.90,.69);
 paint=mix(paint,mix(original,vec3(1.0,.46,.26),wake*.38),relief*entrance);
 paint=mix(paint,edge,relief*crest*.92*entrance);
 // A second, quiet glint completes the underline after the lettering has resolved.
 float sun=mix(-.12,1.22,smoothstep(1.55,2.40,intro));
 float sheen=exp(-pow((along+height*.10-sun)/.045,2.0));
 float finish=sin(smoothstep(1.55,2.6,intro)*3.14159265);
 paint+=vec3(.065,.045,.025)*sheen*finish*glyph*(.25+.75*swash);
 return paint;
}

void main(){gl_FragColor=vec4(hero(vUV,uTime,uIntro),1.0);}
