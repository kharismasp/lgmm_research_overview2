import {esc} from '../core/html.js';
import {futureDirectionsCopy} from '../content/future-directions.js';

const applicationDiagrams = [
  // Cell aggregation: two diffuse regions feed a concentrated cluster.
  `<g class="future-sketch-ghost">
     <ellipse cx="25" cy="39" rx="13" ry="9"/><ellipse cx="113" cy="26" rx="13" ry="9"/>
   </g>
   <g class="future-sketch-outline">
     <path d="M39 39H51m-5-4 5 4-5 4M103 29l-14 6m3-6-3 6 7 1"/>
     <ellipse cx="70" cy="38" rx="19" ry="15"/><ellipse cx="70" cy="38" rx="12" ry="9"/>
   </g>
   <g class="future-sketch-points">
     <circle cx="68" cy="34" r="2.4"/><circle cx="75" cy="38" r="2.5"/><circle cx="65" cy="41" r="2.2"/><circle cx="70" cy="44" r="1.6"/>
   </g>`,
  // Transport: a front moves along a curved channel while remaining narrow.
  `<path class="future-sketch-wash" d="M9 31C36 9 55 14 76 23s40 13 55-5v32c-15 18-34 14-55 5S36 41 9 63Z"/>
   <path class="future-sketch-ghost" d="M9 31C36 9 55 14 76 23s40 13 55-5M9 63c27-22 46-17 67-8s40 13 55-5M44 16c4 8 4 19 0 31"/>
   <g class="future-sketch-outline">
     <path d="M89 28c5 8 5 21 1 32M95 30c5 8 5 21 1 32"/>
     <path d="M57 34c6 .4 12 2 19 5m-6-6 6 6-8 1"/>
   </g>`,
  // Geometric evolution: nearby boundaries show motion; points resolve the bend.
  `<path class="future-sketch-ghost" d="M15 49C21 24 44 17 66 18c16 0 26-5 36-8 9-3 17 1 19 7 6 14-7 29-21 38-25 14-48 6-61 8-13 1-23-4-24-14Z"/>
   <path class="future-sketch-outline" d="M26 47C30 34 47 27 66 27c16 0 29-12 39-7 9 5 4 19-6 26-16 12-32 9-50 10-11 1-21-2-23-9Z"/>
   <g class="future-sketch-points">
     <circle cx="66" cy="27" r="2"/><circle cx="82" cy="23" r="2"/><circle cx="95" cy="19" r="2"/><circle cx="104" cy="20" r="2"/>
     <circle cx="110" cy="27" r="2"/><circle cx="108" cy="36" r="2"/><circle cx="99" cy="46" r="2"/><circle cx="49" cy="56" r="2"/>
   </g>`
];

export function futureDirections(locale) {
  const c = futureDirectionsCopy[locale];
  return `<header class="closing-heading">
    <p class="chapter-index on-dark">13 · ${esc(c.label)}</p><h2>${esc(c.heading)}</h2><p>${esc(c.status)}</p>
  </header>
  <div class="future-pair future-research-branches">
    <article><h3>${esc(c.theory)}</h3>
      <figure><svg class="future-mini" viewBox="0 0 260 75" aria-hidden="true">
        <g fill="#71c9bf25" stroke="#91d5cb" stroke-width="1.8">
          <polygon points="20,65 80,65 20,25"/><polygon points="133,65 253,65 133,45"/>
        </g><path d="M89 43H119m-7-5 7 5-7 5" stroke="#d5e5eb" fill="none"/>
      </svg><figcaption>${esc(c.geometry)}</figcaption></figure>
      <ul class="future-topics">${c.theoryItems.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>
    </article>
    <article><h3>${esc(c.applications)}</h3>
      <p class="future-resolution">${esc(c.resolution)}</p>
      <dl class="future-applications">${c.examples.map(([topic, detail], index) => `
        <div class="future-application">
          <svg viewBox="0 0 140 70" aria-hidden="true">${applicationDiagrams[index]}</svg>
          <div><dt>${esc(topic)}</dt><dd>${esc(detail)}</dd></div>
        </div>`).join('')}</dl>
      <p class="future-scope">${esc(c.scope)}</p>
    </article>
  </div>
  <p class="future-final-question">${esc(c.closing)}</p>`;
}
