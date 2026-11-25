import {makeMeshWrap} from '../content/mesh-wrap.js';
import {meshWrapDialog,meshWrapInspection} from '../templates/mesh-validity.js';

export function mountMeshWrap() {
  const mesh = makeMeshWrap();
  document.body.insertAdjacentHTML('beforeend',meshWrapDialog(mesh));
  const dialog = document.getElementById('mesh-wrap');
  const close = dialog.querySelector('[data-wrap-close]');
  const inspector = dialog.querySelector('#wrap-inspector');
  const buttons = [...dialog.querySelectorAll('[data-wrap-pick]')];
  const highlights = [...dialog.querySelectorAll('[data-wrap-selected]')];
  let trigger;

  function select(index) {
    for (const button of buttons) button.setAttribute('aria-pressed',String(Number(button.dataset.wrapPick)===index));
    for (const highlight of highlights) highlight.toggleAttribute('hidden',Number(highlight.dataset.wrapSelected)!==index);
    inspector.innerHTML = meshWrapInspection(mesh.triangles[index]);
  }

  dialog.addEventListener('click',event => {
    const hit = event.target.closest('[data-wrap-pick],[data-wrap-triangle]');
    if (hit) select(Number(hit.dataset.wrapPick ?? hit.dataset.wrapTriangle));
    else if (event.target === dialog || event.target.closest('[data-wrap-close]')) dialog.close();
  });
  dialog.addEventListener('pointerover',event => {
    const hit = event.target.closest('[data-wrap-pick],[data-wrap-triangle]');
    if (hit && event.pointerType==='mouse') select(Number(hit.dataset.wrapPick ?? hit.dataset.wrapTriangle));
  });
  dialog.addEventListener('keydown',event=>event.stopPropagation());
  dialog.addEventListener('close',()=>trigger?.focus({preventScroll:true}));
  return opener => {
    trigger = opener;
    dialog.scrollTop = 0;
    select(0);
    dialog.showModal();
    close.focus({preventScroll:true});
  };
}
