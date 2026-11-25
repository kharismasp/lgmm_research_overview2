import {mountMeshWrap} from './mesh-wrap.js';
import {meshOdeRecall,lipSeminorm} from '../templates/mesh-validity.js';
import {bindComponent} from './component-actions.js';
import {esc} from './html.js';
import {workshopTerms} from '../content/research-terms.js';
import {appendixPanel, appendixUI, technicalGroups} from '../templates/technical-appendix.js';

const keyboardStep = {ArrowLeft:-1, ArrowRight:1};

export function mountTechnicalAppendix(dialog, group, locale, openAnalysis) {
  const keys = technicalGroups[group].keys;
  const openMeshWrap = group === 'results' ? mountMeshWrap() : null;
  const close = dialog.querySelector('[data-appendix-close]');
  const tabs = [...dialog.querySelectorAll('[data-appendix-tab]')];
  const panel = dialog.querySelector('.technical-panel');
  const scroll = dialog.querySelector('.technical-scroll');
  const ui = appendixUI[locale];
  const glossary = document.createElement('aside');
  glossary.className = 'technical-term';
  glossary.hidden = true;
  dialog.append(glossary);
  let selected = 0;
  let termTrigger;
  let returnFocus;

  function dismissTerm(restoreFocus = false) {
    if (glossary.hidden) return;
    termTrigger?.setAttribute('aria-expanded','false');
    glossary.hidden = true;
    if (restoreFocus) termTrigger?.focus({preventScroll:true});
  }

  function select(index, moveFocus = true) {
    dismissTerm();
    selected = index;
    panel.setAttribute('aria-labelledby', tabs[index].id);
    panel.innerHTML = appendixPanel(group,keys[index],locale);
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected',String(index === i));
      tab.tabIndex = index === i ? 0 : -1;
    });
    const proofSteps = [...panel.querySelectorAll('[data-r2-step]')];
    if (proofSteps.length) selectProofStep(proofSteps[0],false);
    scroll.scrollTop = 0;
    if (moveFocus) tabs[index].focus({preventScroll:true});
  }

  function selectProofStep(step, focus = true) {
    panel.querySelectorAll('[data-r2-step]').forEach(button => {
      const active = button === step;
      button.classList.toggle('active',active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    panel.querySelectorAll('[data-r2-step-panel]').forEach(item => {
      const active = item.dataset.r2StepPanel === step.dataset.r2Step;
      item.classList.toggle('active',active);
      item.hidden = !active;
    });
    if (focus) step.focus({preventScroll:true});
  }

  function syncDerivation() {
    const derivation = panel.querySelector('#qmovDerivation');
    const trigger = panel.querySelector('#qmovDerivationButton');
    if (!derivation || !trigger) return;
    trigger.setAttribute('aria-expanded',String(derivation.open));
    trigger.querySelector('strong').textContent = ui.derivation[Number(derivation.open)];
  }

  function showTerm(trigger) {
    const term = workshopTerms[trigger.dataset.term];
    if (!term) return;
    if (termTrigger === trigger && !glossary.hidden) {
      dismissTerm(true);
      return;
    }
    dismissTerm();
    termTrigger = trigger;
    const related = keys.indexOf(term.jump?.slice(1));
    const isMeshOde = trigger.dataset.term === 'mesh-ode-recall';
    const definition = isMeshOde ? meshOdeRecall() : trigger.dataset.term === 'lip-seminorm'
      ? lipSeminorm : term.bodyHtml || `<p>${esc(term.body)}</p>`;
    glossary.classList.toggle('technical-term-wide',isMeshOde);
    glossary.innerHTML = `<div class="technical-term-head"><p>${ui.glossary}</p><button type="button" data-appendix-dismiss aria-label="${locale === 'ja' ? '用語を閉じる' : 'Close definition'}">×</button></div><h3 lang="en">${esc(term.title)}</h3><div lang="en">${definition}</div>${related >= 0 && related !== selected ? `<button type="button" data-appendix-related="${related}">${ui.related}</button>` : ''}`;
    trigger.setAttribute('aria-expanded','true');
    glossary.hidden = false;
    const box = dialog.getBoundingClientRect();
    const anchor = trigger.getBoundingClientRect();
    const roomAbove = anchor.top - box.top > glossary.offsetHeight + 20;
    glossary.style.top = Math.max(12,Math.min(box.height - glossary.offsetHeight - 12,(roomAbove ? anchor.top - glossary.offsetHeight - 10 : anchor.bottom + 10) - box.top))+'px';
    glossary.querySelector('button').focus({preventScroll:true});
  }

  function open(index, trigger) {
    returnFocus = trigger;
    select(index,false);
    if (!dialog.open) dialog.showModal();
    tabs[selected].focus({preventScroll:true});
  }

  bindComponent(dialog,'click', event => {
    const button = event.target.closest('button');
    if (event.target === dialog || button === close) {
      dialog.close();
      return;
    }
    if (!button) return;
    const tab = button.dataset.appendixTab ?? button.dataset.appendixRelated;
    if (tab !== undefined) select(Number(tab));
    else if (button.hasAttribute('data-open-mesh-wrap')) openMeshWrap?.(button);
    else if (button.hasAttribute('data-open-multid-analysis')) openAnalysis?.(button);
    else if (button.hasAttribute('data-appendix-dismiss')) dismissTerm(true);
    else if (button.hasAttribute('data-r2-step')) selectProofStep(button);
    else if (button.id === 'qmovDerivationButton') {
      const derivation = panel.querySelector('#qmovDerivation');
      derivation.open = !derivation.open;
      syncDerivation();
      if (derivation.open) derivation.scrollIntoView({block:'nearest'});
    }
    else if (button.hasAttribute('data-term')) showTerm(button);
  });

  function keydown(event) {
    event.stopPropagation();
    if (event.key === 'Escape' && !glossary.hidden) {
      event.preventDefault();
      dismissTerm(true);
      return;
    }
    const tab = event.target.closest('[data-appendix-tab],[data-r2-step]');
    if (!tab || !['Home','End','ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const mainTabs = tab.hasAttribute('data-appendix-tab');
    const group = mainTabs ? tabs : [...panel.querySelectorAll('[data-r2-step]')];
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? group.length - 1 : (group.indexOf(tab) + keyboardStep[event.key] + group.length) % group.length;
    if (mainTabs) select(index);
    else selectProofStep(group[index]);
  }

  function closed() {
    dismissTerm();
    if (returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
  }

  function toggle(event) {
    if (event.target.id === 'qmovDerivation') syncDerivation();
  }

  dialog.addEventListener('keydown',keydown);
  dialog.addEventListener('close',closed);
  dialog.addEventListener('toggle',toggle,true);
  return open;
}
