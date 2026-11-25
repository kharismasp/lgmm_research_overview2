import {esc} from '../core/html.js';

const copy = {
  en: {
    matching: 'Characteristic-matching limit',
    general: 'General mesh movement',
    physical: 'First-order backward characteristic map',
    mesh: 'Backward mesh map',
    meshRecall: 'Recall the LGMM nodal motion ODE',
    inGeneral: 'in general',
    matchingDescription: 'The paths overlap schematically to show that the characteristic departure point is approximately the previous mesh node.',
    generalDescription: 'Both arrows start at the current node. The mesh arrow ends at the previous mesh node, while the characteristic arrow ends between mesh nodes.',
    matchingNote: 'Without mesh regularization, the backward mesh map approximately matches the backward characteristic map at the nodes.',
    generalNote: 'In general, the mesh velocity defines its own backward map, which need not coincide with the physical characteristic map.'
  },
  ja: {
    matching: '特性写像に近づく場合',
    general: '一般のメッシュ移動',
    physical: '一次の後退特性写像',
    mesh: '後退メッシュ写像',
    meshRecall: 'LGMM の節点移動方程式を表示',
    inGeneral: '一般には',
    matchingDescription: '二つの経路を重ねて、特性写像の出発点が前時刻の対応する節点に近いことを模式的に示す。',
    generalDescription: '二つの矢印は現在の節点から出発する。メッシュ写像は前時刻の対応する節点へ、特性写像は節点間の点へ写す。',
    matchingNote: 'メッシュ正則化がない場合、節点では後退メッシュ写像と後退特性写像が近似的に一致する。',
    generalNote: '一般に、メッシュ速度が定める後退写像は、物理的な後退特性写像と一致するとは限らない。'
  }
};

const script = (base, sub, sup) => `<msubsup><mi>${base}</mi>${sub}${sup}</msubsup>`;
const now = '<mi>n</mi>';
const previous = '<mrow><mi>n</mi><mo>−</mo><mn>1</mn></mrow>';
const currentNode = script('P', '<mi>i</mi>', now);
const oldNode = script('P', '<mi>i</mi>', previous);
const x = '<mi>x</mi>';
const argumentsOf = value => `<mo>(</mo>${value}<mo>)</mo>`;
const map = (name, value) => `${script(name, '<mn>1</mn>', now)}${argumentsOf(value)}`;
const time = level => `<msup><mi>t</mi>${level}</msup>`;
const backwardStep = velocity => `${x}<mo>−</mo><mi mathvariant="normal">Δ</mi><mi>t</mi>${velocity}${argumentsOf(x)}`;

function definitions(c) {
  const physicalVelocity = `<msup><mi>𝐮</mi>${now}</msup>`;
  const meshVelocity = `<mtext><button class="equation-recall-link mesh-equation-link" type="button"
    popovertarget="meshEquationRecall" aria-label="${esc(c.meshRecall)}"><math>${script('𝐰', '<mi>h</mi>', now)}</math></button></mtext>`;
  const meshFlow = `<mi>Y</mi>${argumentsOf(`${time(previous)}<mo>;</mo>${x}<mo>,</mo>${time(now)}`)}`;
  return `<div class="xy-definitions" data-slide-step="0">
    <div class="xy-definition">
      <p class="xy-key-physical">${esc(c.physical)}</p>
      <div class="xy-definition-formula">
        <math><mrow>${map('X', x)}<mo>:=</mo>${backwardStep(physicalVelocity)}</mrow></math>
      </div>
    </div>
    <div class="xy-definition">
      <p class="xy-key-mesh">${esc(c.mesh)}</p>
      <div class="xy-definition-formula">
        <math><mrow>${map('Y', x)}<mo>:=</mo>${meshFlow}</mrow></math>
        <math><mrow><mo>≈</mo>${backwardStep(meshVelocity)}</mrow></math>
      </div>
    </div>
  </div>`;
}

function formula(general, c) {
  return `<div class="xy-formula">
    <math><mrow>${map('Y', currentNode)}<mo>=</mo>${oldNode}</mrow></math>
    <math><mrow><mo>${general ? '≠' : '≈'}</mo>${map('X', currentNode)}</mrow></math>
    ${general ? `<span>${esc(c.inGeneral)}</span>` : ''}
  </div>`;
}

function diagram(general, description) {
  const id = general ? 'general' : 'matching';
  const upperNodes = [64,119,176,268,340,418];
  const physical = 207;
  const mesh = general ? 177 : physical;
  const lowerNodes = [64,113,150,mesh,312,418];
  const arrival = upperNodes[3];
  const labelMeshX = (arrival + mesh) / 2 - 15;
  const labelPhysicalX = (arrival + physical) / 2 + 15;
  const marks = (nodes, level, selected) => nodes.filter(x => x !== selected).map(x =>
    `<circle cx="${x}" cy="${level}" r="4" class="xy-node"/>`
  ).join('');
  return `<svg class="xy-diagram${general ? '' : ' xy-diagram-matching'}" viewBox="0 0 494 206" role="img" aria-label="${esc(description)}">
    <defs>
      <marker id="xy-mesh-${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
        <path class="xy-arrow-mesh" d="M0 0L10 5L0 10Z"/>
      </marker>
      ${general ? `<marker id="xy-physical-${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
        <path class="xy-arrow-physical" d="M0 0L10 5L0 10Z"/>
      </marker>` : ''}
    </defs>
    <path class="xy-axis" d="M64 46H418 M64 144H418"/>
    <text class="xy-level" x="13" y="52">tⁿ</text><text class="xy-level" x="13" y="150">tⁿ⁻¹</text>
    <text class="xy-level" x="434" y="52">Ωⁿ</text><text class="xy-level" x="434" y="150">Ωⁿ⁻¹</text>
    <line class="xy-track xy-mesh" x1="${arrival}" y1="46" x2="${mesh}" y2="144" marker-end="url(#xy-mesh-${id})"/>
    <line class="xy-track xy-physical" x1="${arrival}" y1="46" x2="${physical}" y2="144"${general ? ` marker-end="url(#xy-physical-${id})"` : ''}/>
    ${marks(upperNodes, 46, arrival)}
    ${marks(lowerNodes, 144, mesh)}
    <circle class="xy-current" cx="${arrival}" cy="46" r="6"/>
    <circle class="xy-endpoint xy-mesh" cx="${mesh}" cy="144" r="6"/>
    ${general ? `<circle class="xy-endpoint xy-physical" cx="${physical}" cy="144" r="5"/>` : ''}
    <text class="xy-point" x="${arrival}" y="25" text-anchor="middle">Pᵢⁿ</text>
    <text class="xy-point xy-map-label xy-mesh" x="${labelMeshX}" y="98" text-anchor="end">Y₁ⁿ</text>
    <text class="xy-point xy-map-label xy-physical" x="${labelPhysicalX}" y="98" text-anchor="start">X₁ⁿ</text>
    ${general ? `
      <text class="xy-point xy-mesh" x="${mesh - 8}" y="174" text-anchor="end">Y₁ⁿ(Pᵢⁿ)</text>
      <text class="xy-point xy-mesh" x="${mesh - 8}" y="195" text-anchor="end">= Pᵢⁿ⁻¹</text>
      <text class="xy-point xy-physical" x="${physical + 8}" y="174">X₁ⁿ(Pᵢⁿ)</text>
    ` : `<text class="xy-point" x="${physical}" y="174" text-anchor="middle">Pᵢⁿ⁻¹ ≈ X₁ⁿ(Pᵢⁿ)</text>`}
  </svg>`;
}

export function p02Comparison(locale) {
  const c = copy[locale];
  return `${definitions(c)}
    <div class="xy-comparison">
      <figure class="xy-case" data-slide-step="0">
        <header class="xy-case-heading">
          <h3>${esc(c.matching)}</h3>
          <math class="xy-qualifier"><mrow><msub><mi>ν</mi><mi>M</mi></msub><mo>=</mo><mn>0</mn></mrow></math>
        </header>
        ${formula(false, c)}
        ${diagram(false, c.matchingDescription)}
        <figcaption>${esc(c.matchingNote)}</figcaption>
      </figure>
      <figure class="xy-case" data-slide-step="1">
        <header class="xy-case-heading"><h3>${esc(c.general)}</h3></header>
        ${formula(true, c)}
        ${diagram(true, c.generalDescription)}
        <figcaption>${esc(c.generalNote)}</figcaption>
      </figure>
    </div>`;
}
