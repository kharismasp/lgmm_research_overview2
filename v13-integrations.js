import {futureDirections} from './templates/future-directions.js';
import {p02Comparison} from './templates/research-p02.js';
import {mountTechnicalAppendix} from './core/technical-appendix.js';
import {installSparkInteractions} from './core/sparks.js';
import {bindComponent} from './core/component-actions.js';
import {technicalDialog, technicalGroups} from './templates/technical-appendix.js';

export function setupV13Integrations() {
  const locale=new URLSearchParams(location.search).get('notes')==='ja'?'ja':'en';
  const technical = Object.fromEntries(Object.entries(technicalGroups).map(([group, content]) => {
    document.body.insertAdjacentHTML('beforeend',technicalDialog(group,locale));
    const dialog = document.getElementById(`technical-${group}`);
    const openAnalysis = group === 'results'
      ? trigger => technical.analysis.open(0,trigger)
      : undefined;
    return [group, {keys:content.keys, open:mountTechnicalAppendix(dialog,group,locale,openAnalysis)}];
  }));
  for (const trigger of document.querySelectorAll('[data-technical-group]')) {
    const {technicalGroup, technicalTopic} = trigger.dataset;
    if (technicalGroup === 'analysis' && locale === 'ja') {
      const label = trigger.querySelector('strong') || trigger;
      label.textContent = technicalGroups.analysis.ja.heading;
    }
    trigger.addEventListener('click',event => {
      event.preventDefault();
      const overview = trigger.closest('dialog');
      const returnFocus = overview ? document.getElementById(overview.dataset.opener || 'overviewToggle') : trigger;
      if (overview?.open) overview.close();
      technical[technicalGroup].open(technical[technicalGroup].keys.indexOf(technicalTopic),returnFocus);
    });
  }
  const characteristicCue = document.getElementById('lgCharacteristicOpen');
  const characteristicDialog = document.getElementById('lgCharacteristicDialog');
  bindComponent(characteristicCue,'click',() => characteristicDialog.showModal());
  characteristicDialog.addEventListener('close',() => characteristicCue.focus({preventScroll:true}));

  const comparison = document.querySelector('.xy-host');
  comparison.lang = locale;
  comparison.innerHTML = p02Comparison(locale);
  const equation = document.querySelector('#model .model-system-math mtr:first-child mtd:first-child');
  document.querySelector('#materialEquationRecall .equation-recall-math').innerHTML =
    `<math display="block"><mrow>${equation.innerHTML}</mrow></math>`;
  const meshLaw = document.querySelector('#mesh-kinematics .wide-formal math semantics > mrow');
  const terms = [...meshLaw.children];
  const plus = terms.findIndex(term => term.matches('mo') && term.textContent === '+');
  const qualifier = terms.findIndex(term => term.matches('mspace'));
  const rows = [terms.slice(0,plus), terms.slice(plus,qualifier), terms.slice(qualifier + 1)];
  document.querySelector('#meshEquationRecall .equation-recall-math').innerHTML = rows.map(row =>
    `<math><mrow>${row.map(term => term.outerHTML).join('')}</mrow></math>`
  ).join('');

  const outlook=document.getElementById('future-directions-content');
  outlook.lang=locale;
  outlook.innerHTML=futureDirections(locale);

  const language=document.getElementById('supplementLanguage');
  language.value=locale;
  language.addEventListener('change',()=>{
    const url=new URL(location.href);
    if(language.value==='ja')url.searchParams.set('notes','ja');
    else url.searchParams.delete('notes');
    location.assign(url);
  });

  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  installSparkInteractions(document,{isReduced:()=>reduced.matches});
  return {
    openTechnicalLink(hash, checkOnly=false, trigger) {
      const key = (hash || '').slice(1);
      for (const [group,{keys,open}] of Object.entries(technical)) {
        const index = key === 'multi-d-analysis' ? keys.indexOf('error-equation') : keys.indexOf(key);
        if (index === -1) continue;
        if (!checkOnly) open(index,trigger);
        return group === 'results' ? 'results-map' : 'beyond-aggregation';
      }
      return false;
    }
  };
}
