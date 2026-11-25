import {esc} from '../core/html.js';
import {validityDetails} from './mesh-validity.js';
import {multidimensionalErrorEstimate} from './multidimensional-error.js';
import {technicalSections} from '../content/technical-appendix.js';

export const technicalGroups = {
  results: {
    keys: ['geometry-theorem','mass-stability','stability','error-1d'],
    en: {heading:'Main results', topics:['Mesh validity','Mass conservation','Stability','Error estimates']},
    ja: {heading:'主な結果', topics:['メッシュの妥当性','質量保存性','安定性','誤差評価']}
  },
  analysis: {
    keys: ['error-equation','projection-strategy','r2-analysis','analysis-target'],
    en: {heading:'Multi-D Error Analysis', topics:['Error equation','Elliptic projection','Residual R₂','Material derivative estimate']},
    ja: {heading:'多次元誤差解析', topics:['誤差方程式','楕円射影','残差 R₂','物質微分の評価']}
  }
};

export const appendixUI = {
  en: {
    close:'Close', derivation:['Show derivation','Hide derivation'],
    glossary:'Definition', related:'Related section',
    massCondition:'For exact mass conservation, the source and boundary flux vanish and the two-step scheme starts with a compatible first step.'
  },
  ja: {
    close:'閉じる', derivation:['導出を表示','導出を閉じる'],
    glossary:'用語の定義', related:'関連する補足',
    massCondition:'質量が厳密に保存されるのは、ソース項と境界流束がともにゼロで、初回の計算が2段法と整合する場合である。'
  }
};

export function technicalDialog(group, locale) {
  const {heading,topics} = technicalGroups[group][locale];
  return `<dialog id="technical-${group}" class="technical-dialog" aria-labelledby="technical-${group}-title">
    <div class="technical-shell">
      <header class="technical-header">
        <h2 id="technical-${group}-title">${heading}</h2>
        <button type="button" data-appendix-close>${appendixUI[locale].close}</button>
      </header>
      <div class="technical-tabs" role="tablist" aria-label="${heading}">
        ${topics.map((topic,index)=>`<button type="button" role="tab" id="technical-${group}-tab-${index}" data-appendix-tab="${index}" aria-controls="technical-${group}-panel" aria-selected="false" tabindex="-1">${esc(topic)}</button>`).join('')}
      </div>
      <div class="technical-scroll">
        <div class="technical-panel" id="technical-${group}-panel" role="tabpanel" tabindex="0"></div>
      </div>
    </div>
  </dialog>`;
}

function sourceSection(key) {
  const source = document.createElement('template');
  source.innerHTML = technicalSections[key];
  return source.content;
}

function resultStatement(key, locale) {
  const source = sourceSection(key === 'stability' ? 'mass-stability' : key);
  const statement = source.querySelector(key === 'stability' ? '.theorem-box:nth-child(2)' : '.theorem-box');
  let assumptions = '';
  if (key === 'geometry-theorem') {
    assumptions = source.querySelector('.mesh-update-definition').outerHTML;
  } else {
    const hypothesis = sourceSection('mass-stability').querySelector('.hypothesis-banner');
    assumptions = hypothesis.outerHTML;
  }

  const exact = statement.querySelector('.inline-exact');
  if (exact) {
    statement.querySelector('.theorem-body > p').remove();
    exact.replaceWith(exact.querySelector('p'));
  }
  const condition = key === 'mass-stability'
    ? `<p class="result-condition" lang="${locale}">${esc(appendixUI[locale].massCondition)}</p>`
    : '';
  if (key === 'geometry-theorem') {
    statement.querySelector('.theorem-body').insertAdjacentHTML('beforeend',validityDetails());
    const condition = source.querySelector('.claim-boundary');
    statement.querySelector('.mesh-validity-details').after(condition);
  }
  const analysisButton = key === 'error-1d'
    ? `<button type="button" class="analysis-tile result-analysis" lang="${locale}" data-open-multid-analysis aria-haspopup="dialog" aria-controls="technical-analysis">${esc(technicalGroups.analysis[locale].heading)}</button>`
    : '';
  const multidimensional = key === 'error-1d' ? multidimensionalErrorEstimate() : '';
  return `<div class="technical-v13 result-statement" lang="en">${assumptions}${statement.outerHTML}${condition}${analysisButton}${multidimensional}</div>`;
}

export function appendixPanel(group, key, locale) {
  if (group === 'results') return resultStatement(key,locale);
  return `<div class="research-workshop-cut technical-v13" lang="en">${technicalSections[key]}</div>`;
}
