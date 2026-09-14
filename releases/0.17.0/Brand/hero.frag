precision highp float;
varying vec2 vUV;
uniform sampler2D uArt,uPlate,uMasks;
uniform float uTime,uIntro;
vec4 art(vec2 p){return texture2D(uArt,clamp(p,0.0,1.0));}
vec4 plate(vec2 p){return texture2D(uPlate,clamp(p,0.0,1.0));}
vec4 masks(vec2 p){return texture2D(uMasks,clamp(p,0.0,1.0));}
// One-shot light build on the original painted wordmark. All scene UVs stay fixed.
vec3 hero(vec2 p,float t,float intro)
{
 vec3 original=art(p).rgb;
 if(intro>=1.65)return original;
 vec3 clean=plate(p).rgb;
 float pigment=smoothstep(.045,.12,original.r-original.b);
 float changed=smoothstep(.14,.30,length(original-clean));
 float glyph=masks(p).b*pigment*changed;
 float sweep=mix(.36,1.12,smoothstep(0.0,1.5,intro));
 float reveal=1.0-smoothstep(sweep-.08,sweep+.015,p.x-p.y*.08);
 float glint=exp(-pow((p.x-p.y*.08-sweep)/.028,2.0))*sin(clamp(intro/1.65,0.0,1.0)*3.14159265);
 vec3 developed=original*mix(.64,1.0,reveal)+vec3(.12,.095,.055)*glint;
 return mix(original,developed,glyph);
}

void main(){gl_FragColor=vec4(hero(vUV,uTime,uIntro),1.0);}
