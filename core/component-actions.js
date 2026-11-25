// Native events and remote intents share the exact registered component handler.
// Remote execution never synthesizes a browser mouse click or a user gesture.
const registry=new WeakMap();
export function bindComponent(element,type,handler,options){
 element.addEventListener(type,handler,options);
 if(!['click','input','change'].includes(type))return ()=>element.removeEventListener(type,handler,options);
 const record={type,handler,capture:options===true||options?.capture===true};
 const records=registry.get(element)||[];records.push(record);registry.set(element,records);
 return ()=>{element.removeEventListener(type,handler,options);const list=registry.get(element);if(list){const i=list.indexOf(record);if(i>=0)list.splice(i,1);}};
}
export function invokeComponent(target,type,point={}){
 const chain=[];let node=target;while(node){chain.push(node);node=node.parentNode;}
 let stopped=false,immediate=false,handled=false;
 const event={type,target,currentTarget:null,isTrusted:false,remote:true,button:0,buttons:0,detail:1,
  clientX:point.x||0,clientY:point.y||0,ctrlKey:false,metaKey:false,altKey:false,shiftKey:false,
  defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},stopPropagation(){stopped=true;},
  stopImmediatePropagation(){stopped=true;immediate=true;},composedPath:()=>chain};
 function call(element,capture){
  event.currentTarget=element;
  for(const record of [...(registry.get(element)||[])]){
   if(record.type!==type||record.capture!==capture)continue;
   handled=true;record.handler(event);if(immediate)break;
  }
 }
 for(const el of [...chain].reverse()){call(el,true);if(stopped)break;}
 if(!stopped)for(const el of chain){call(el,false);if(stopped)break;}
 return {handled,prevented:event.defaultPrevented};
}
