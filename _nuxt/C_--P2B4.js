import{d as p,q as _,r as S,v as x,x as E,y as k,o as q,g as A,_ as B}from"./BXURiijc.js";const C=a=>{const t=Object.create(null);for(const r in a){const o=a[r];o!==void 0&&(t[r]=o)}return t},h=(a,t)=>(r,o)=>(_(()=>a({...C(r),...o.attrs},o)),()=>{var i,s;return t?(s=(i=o.slots).default)==null?void 0:s.call(i):null}),T={accesskey:String,autocapitalize:String,autofocus:{type:Boolean,default:void 0},class:[String,Object,Array],contenteditable:{type:Boolean,default:void 0},contextmenu:String,dir:String,draggable:{type:Boolean,default:void 0},enterkeyhint:String,exportparts:String,hidden:{type:Boolean,default:void 0},id:String,inputmode:String,is:String,itemid:String,itemprop:String,itemref:String,itemscope:String,itemtype:String,lang:String,nonce:String,part:String,slot:String,spellcheck:{type:Boolean,default:void 0},style:String,tabindex:String,title:String,translate:String},P=p({name:"Title",inheritAttrs:!1,setup:h((a,{slots:t})=>{var r,o,i;return{title:((i=(o=(r=t.default)==null?void 0:r.call(t))==null?void 0:o[0])==null?void 0:i.children)||null}})}),N=p({name:"Meta",inheritAttrs:!1,props:{...T,charset:String,content:String,httpEquiv:String,name:String,body:Boolean,renderPriority:[String,Number]},setup:h(a=>{const t={...a};return t.httpEquiv&&(t["http-equiv"]=t.httpEquiv,delete t.httpEquiv),{meta:[t]}})}),M=["innerHTML"],L=p({__name:"MathDocument",props:{body:{}},setup(a){const t=S(null),r=S(null),o=()=>{var g,v;const i=t.value.querySelectorAll("table");for(const e of i){e.classList.add("table","table-bordered","table-hover");const n=e.parentNode,l=document.createElement("div");l.classList.add("table-responsive"),n.replaceChild(l,e),l.appendChild(e)}const s=t.value.querySelectorAll(".bookref");let d=0;for(const e of s){const n=e.firstElementChild;d=Math.max(d,n.offsetWidth)}const f=`${d+15}px`;t.value.style.paddingRight=f;for(const e of s){const n=e.firstElementChild;n.style.right=f}const y=t.value.querySelectorAll(".devlink");for(const e of y){const n=document.createElement("a");n.innerText="Développement",n.setAttribute("href",`/developpements/${e.textContent.trim()}/`),e.replaceChildren(n),e.nextElementSibling&&((g=e.parentNode)==null||g.insertBefore(e.nextElementSibling,e))}const m=t.value.querySelectorAll(".proof");for(let e=0;e<m.length;e++){const n=m[e],l=`proof-${e+1}`,c=document.createElement("details");c.setAttribute("id",l),c.innerHTML=n.outerHTML,(v=n.parentNode)==null||v.insertBefore(c,n),n.remove();const u=document.createElement("summary");u.classList.add("proof-label"),u.innerText="Preuve",c.insertBefore(u,c.firstChild)}const b=t.value.querySelectorAll('[data-reference-type="ref"]');for(const e of b){const n=document.getElementById(e.getAttribute("data-reference"));if(n){const l=n.querySelector("strong, em");l&&l.textContent&&(e.textContent=l.textContent)}}r.value=null};return x(async()=>{await E(),o()}),k(()=>{r.value&&(clearTimeout(r.value),r.value=null)}),(i,s)=>(q(),A("div",{ref_key:"root",ref:t,class:"math-document",innerHTML:i.body},null,8,M))}}),D=B(L,[["__scopeId","data-v-dfd46549"]]);export{N as M,P as T,D as _};