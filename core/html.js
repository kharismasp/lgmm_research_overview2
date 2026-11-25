export const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const button=(label,action,value='',className='')=>`<button type="button" class="${className}" data-action="${esc(action)}" data-value="${esc(value)}">${/[→↗]$/.test(label)?`<span class="button-label">${esc(label.slice(0,-1).trimEnd())}</span><span class="button-arrow" aria-hidden="true">${esc(label.slice(-1))}</span>`:esc(label)}</button>`;
export const paragraphs=body=>(body||[]).map(x=>`<p>${esc(x)}</p>`).join('');
