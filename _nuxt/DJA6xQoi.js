const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./BpIznerv.js","./BXURiijc.js","./CUdimxdD.js","./CE0uVtAL.js","./C-v3KzvZ.js","./DyVB06ra.js"])))=>i.map(i=>d[i]);
import{h as c,u as f}from"./CE0uVtAL.js";import{q as v,w as m,e as g,s as d,j as l,a as h,b as _}from"./CUdimxdD.js";import{J as y,N as C,d as w,O as P,c as N,P as $,K as j,M as r,Q as T}from"./BXURiijc.js";const D=async e=>{const{content:t}=y().public;typeof(e==null?void 0:e.params)!="function"&&(e=v(e));const a=e.params(),s=t.experimental.stripQueryParameters?m(`/navigation/${`${c(a)}.${t.integrity}`}/${g(a)}.json`):m(`/navigation/${c(a)}.${t.integrity}.json`);if(d())return(await C(()=>import("./BpIznerv.js"),__vite__mapDeps([0,1,2,3,4,5]),import.meta.url).then(o=>o.generateNavigation))(a);const n=await $fetch(s,{method:"GET",responseType:"json",params:t.experimental.stripQueryParameters?void 0:{_params:l(a),previewToken:f().getPreviewToken()}});if(typeof n=="string"&&n.startsWith("<!DOCTYPE html>"))throw new Error("Not found");return n},E=w({name:"ContentNavigation",props:{query:{type:Object,required:!1,default:void 0}},async setup(e){const{query:t}=P(e),a=N(()=>{var n;return typeof((n=t.value)==null?void 0:n.params)=="function"?t.value.params():t.value});if(!a.value&&$("dd-navigation").value){const{navigation:n}=h();return{navigation:n}}const{data:s}=await _(`content-navigation-${c(a.value)}`,()=>D(a.value));return{navigation:s}},render(e){const t=j(),{navigation:a}=e,s=o=>r(T,{to:o._path},()=>o.title),n=(o,u)=>r("ul",u?{"data-level":u}:null,o.map(i=>i.children?r("li",null,[s(i),n(i.children,u+1)]):r("li",null,s(i)))),p=o=>n(o,0);return t!=null&&t.default?t.default({navigation:a,...this.$attrs}):p(a)}}),Q=E;export{Q as default};