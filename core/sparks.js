const triggers=new Set(['pointer','spark-demo']);
const lastEmission=new WeakMap();
export function sparkAllowed({action,safe=false,reduced=false}){return triggers.has(action)&&!safe&&!reduced;}
export function clearSparks(doc=globalThis.document){doc?.querySelector('.click-spark-layer')?.remove();}
const clock=()=>globalThis.performance?.now?.()??Date.now();
export function emitSpark({action,x,y,tone='light',safe=false,reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches||false,doc=globalThis.document}){
 if(!sparkAllowed({action,safe,reduced})||!doc||!Number.isFinite(x)||!Number.isFinite(y))return false;
 const now=clock(),last=lastEmission.get(doc);if(last!==undefined&&now-last<90)return false;
 let layer=doc.querySelector('.click-spark-layer');
 if(!layer){layer=doc.createElement('div');layer.className='click-spark-layer';layer.setAttribute('aria-hidden','true');doc.body.append(layer);}
 if(layer.childElementCount>=3)return false;
 const burst=doc.createElement('span');burst.className='click-spark-burst burst-on-'+(tone==='dark'?'dark':'light');
 burst.style.left=Math.max(0,Math.min((globalThis.innerWidth||1920)-1,x))+'px';burst.style.top=Math.max(0,Math.min((globalThis.innerHeight||1080)-1,y))+'px';
 const motions=[[-21,-16],[18,-22],[25,3],[13,22],[-15,23],[-25,4]];
 motions.forEach(([dx,dy],i)=>{const p=doc.createElement('i');p.className='click-spark-particle repaired-particle particle-'+i;p.style.setProperty('--drift-x',dx+'px');p.style.setProperty('--drift-y',dy+'px');p.style.setProperty('--spark-rotation',(i===1?18:0)+'deg');
  if(i<2)p.innerHTML=`<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1 L12.3 7.7 L19 10 L12.3 12.3 L10 19 L7.7 12.3 L1 10 L7.7 7.7 Z"/></svg>`;
  burst.append(p);
 });
 layer.append(burst);lastEmission.set(doc,now);
 setTimeout(()=>{burst.remove();if(!layer.childElementCount)layer.remove();},790);return true;
}
export function installSparkInteractions(root,{isSafe=()=>false,isReduced=()=>false,isPublic=()=>true,doc=root?.ownerDocument||globalThis.document}={}){
 const excluded='input,textarea,select,[contenteditable="true"],.command-palette,.palette-backdrop,.utility-panel,.utility-menu,.modal,.presenter-console,.preflight,.lab-controls';
 const pointer=e=>{
  if(e.isPrimary===false||(e.button!==undefined&&e.button!==0))return;
  const t=e.target?.closest?e.target:e.target?.parentElement;if(!t||t.closest?.(excluded))return;
  const demo=!!t.closest?.('.cursor-demo-area');if(!isPublic()&&!demo)return;
  if(t.closest?.('[disabled]'))return;
  emitSpark({action:'pointer',x:e.clientX,y:e.clientY,doc,safe:isSafe(),reduced:isReduced(),tone:t.closest?.('.primary,.ink-focus,.material-ink,.dark-demo')?'dark':'light'});
 };
 root?.addEventListener('pointerdown',pointer,{passive:true});
 return {dispose(){root?.removeEventListener?.('pointerdown',pointer);}};
}
