import {makeMeshWrap} from '../content/mesh-wrap.js';
import {esc} from '../core/html.js';

const title = 'Does positive orientation imply global injectivity?';
const colors = ['#2b8d9a','#6387bf','#b08640','#7374a7','#c56651'];
const fmt = x => String(Number(x.toFixed(6)));
const coordinates = p => `(${p.map(fmt).join(', ')})`;
const source = 'https://doi.org/10.1137/130939754';

export function validityDetails() {
  return `<div class="mesh-validity-details">
    <button type="button" class="analysis-tile" data-open-mesh-wrap aria-haspopup="dialog" aria-controls="mesh-wrap">${title}</button>
    <details class="math-detail mesh-proof">
      <summary>Why the time-step restriction works</summary>
      <div class="detail-content">
        <h4>Global injectivity</h4>
        <p>For x, y ∈ Ω<sup>n−1</sup>, the reverse triangle inequality and the Lipschitz bound give</p>
        <div class="popup-math mesh-proof-math">|Φ<sup>n</sup>(x) − Φ<sup>n</sup>(y)| ≥ |x − y| − Δt |w<sub>h</sub>(x) − w<sub>h</sub>(y)| ≥ (1 − Δt |w<sub>h</sub>|<sub>Lip, Ω<sup>n−1</sup></sub>) |x − y|.</div>
        <p>With Δt |w<sub>h</sub>|<sub>Lip, Ω<sup>n−1</sup></sub> &lt; 1, this bound is strictly positive for x ≠ y.</p>
        <h4>Positive orientation of each simplex</h4>
        <p>On K, let A<sub>K</sub> = Dw<sub>h</sub>|<sub>K</sub>. Then DΦ<sup>n</sup>|<sub>K</sub> = I + Δt A<sub>K</sub>. The induced Euclidean operator norm ‖A<sub>K</sub>‖<sub>2</sub> is bounded by the Lipschitz seminorm. Thus ‖sΔt A<sub>K</sub>‖<sub>2</sub> &lt; 1 for every 0 ≤ s ≤ 1, so I + sΔt A<sub>K</sub> is nonsingular throughout the path. Its determinant starts at +1 and cannot change sign. Multiplying the original positive edge determinant by det(I + Δt A<sub>K</sub>) preserves its sign.</p>
      </div>
    </details>
  </div>`;
}

export function meshOdeRecall() {
  // Reuse the actual Section 6 equation so the two displays cannot drift apart.
  const ode = document.querySelector('#mesh-kinematics .wide-formal math');
  return `<p>Interior nodes satisfy</p><div class="popup-math">${ode.outerHTML}</div><svg viewBox="0 0 290 80" class="mesh-recall-figure" role="img" aria-label="Interior mesh nodes move while boundary nodes stay fixed"><g stroke="#8caeb9" stroke-width="1.5"><path d="M15 22H275M15 60H275"/><path d="M15 22V60M65 22L100 60M130 22L145 60M195 22L180 60M275 22V60" stroke-dasharray="4 3"/></g><g fill="#367d8f">${[15,65,130,195,275].map(x=>`<circle cx="${x}" cy="22" r="4"/>`).join('')}${[15,100,145,180,275].map(x=>`<circle cx="${x}" cy="60" r="4"/>`).join('')}</g><g fill="currentColor" font-size="11"><text x="5" y="13">tⁿ⁻¹</text><text x="5" y="78">tⁿ</text></g></svg>
    <p>The u term gives physical transport. The ν<sub>M</sub> term adjusts node spacing. Boundary vertices stay fixed.</p>`;
}

export const lipSeminorm = `<div class="popup-math">
  <math display="block"><mrow>
    <msub><mrow><mo>|</mo><msub><mi>w</mi><mi>h</mi></msub><mo>|</mo></mrow><mrow><mi mathvariant="normal">Lip</mi><mo>,</mo><msup><mi>Ω</mi><mrow><mi>n</mi><mo>−</mo><mn>1</mn></mrow></msup></mrow></msub>
    <mo>=</mo><munder><mo>sup</mo><mtable rowspacing="0"><mtr><mtd><mi>x</mi><mo>,</mo><mi>y</mi><mo>∈</mo><msup><mi>Ω</mi><mrow><mi>n</mi><mo>−</mo><mn>1</mn></mrow></msup></mtd></mtr><mtr><mtd><mi>x</mi><mo>≠</mo><mi>y</mi></mtd></mtr></mtable></munder>
    <mfrac><mrow><mo>|</mo><msub><mi>w</mi><mi>h</mi></msub><mo>(</mo><mi>x</mi><mo>)</mo><mo>−</mo><msub><mi>w</mi><mi>h</mi></msub><mo>(</mo><mi>y</mi><mo>)</mo><mo>|</mo></mrow><mrow><mo>|</mo><mi>x</mi><mo>−</mo><mi>y</mi><mo>|</mo></mrow></mfrac>
  </mrow></math></div><p>Here |·| on vectors denotes Euclidean length. Adding the supremum norm gives the full Lipschitz norm.</p>`;

function diagram(mesh, frame) {
  const original = frame === 'before';
  const project = original ? ([x,y]) => [28+74*x,105-64*y] : ([x,y]) => [207+47*x,119-47*y];
  const vertices = new Map();
  for (const v of mesh.vertices) {
    const key = v[frame].join(',');
    const names = vertices.get(key) || [];
    names.push(v.name); vertices.set(key,names);
  }
  const polygon = t => t.vertices.map(v=>project(v[frame]).join(',')).join(' ');
  const vertexMark = ([key,names]) => {
    const [x,y] = project(key.split(',').map(Number));
    const left = x > 305;
    const beneath = original ? y > 90 : y > 141;
    return `<circle class="wrap-vertex" cx="${x}" cy="${y}" r="2.7"/>
      <text class="wrap-vertex-label" x="${x+(original?0:left?-6:6)}" y="${y+(beneath?17:-8)}" text-anchor="${original?'middle':left?'end':'start'}">${names.join(', ')}</text>`;
  };
  const viewBox = original ? '0 0 426 148' : '0 0 426 242';
  const patterns = original ? '' : `<defs><pattern id="wrap-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0V8" stroke="#a34e40" stroke-width="2.5"/></pattern></defs>`;
  const selected = mesh.triangles.map(t=>`<polygon class="wrap-selection" data-wrap-selected="${t.cell*2+t.kind}" points="${polygon(t)}" style="--cell:${colors[t.cell]}" hidden/>`).join('');
  const dots = (original?mesh.points:[mesh.points[0]]).map(p=>{
    const [x,y]=project(p[frame]);
    return `<circle class="wrap-point" cx="${x}" cy="${y}" r="5"/><text class="wrap-point-label" x="${x+8}" y="${y-6}">${original?p.label:'Φ(a) = Φ(b)'}</text>`;
  }).join('');
  return `<svg viewBox="${viewBox}" class="wrap-svg" aria-label="${original?'Connected strip with a and b in cells 1 and 5':'Polygonal wrap. Cells 1 and 5 overlap exactly, and the images of a and b agree.'}" role="img">
    ${patterns}
    ${(original?mesh.triangles:mesh.triangles.slice(0,8)).map(t=>`<polygon class="wrap-triangle" data-wrap-triangle="${t.cell*2+t.kind}" points="${polygon(t)}" style="--cell:${colors[t.cell]};--tint:${t.kind?'20%':'35%'}"/>`).join('')}
    ${original?'':mesh.triangles.slice(8).map(t=>`<polygon class="wrap-overlap" points="${polygon(t)}"/>`).join('')}
    ${selected}${[...vertices].map(vertexMark).join('')}${dots}
  </svg>`;
}

export function meshWrapDialog(mesh=makeMeshWrap()) {
  const [a,b] = mesh.points;
  const minimum = Math.min(...mesh.triangles.map(t=>t.after));
  return `<dialog id="mesh-wrap" class="p02-focus mesh-wrap" aria-labelledby="mesh-wrap-title">
    <header class="p02-head"><h2 id="mesh-wrap-title">${title}</h2><button type="button" data-wrap-close>Close ×</button></header>
    <p class="wrap-verdict"><strong>In multiple dimensions, positive orientation of every element alone does not guarantee global injectivity.</strong> Here all ${mesh.triangles.length} signed edge determinants are positive (minimum ${fmt(minimum)}), yet two cell interiors share the same image.</p>
    <div class="wrap-figures">
      <figure><h3>Original triangulation</h3>${diagram(mesh,'before')}<figcaption>Five cells of [0, 5] × [0, 1], with a single vertex table and two triangles per cell.</figcaption></figure>
      <figure><h3>Mapped triangulation</h3>${diagram(mesh,'after')}<figcaption>Hatching marks the common image of cells 1 and 5. The connectivity is unchanged.</figcaption></figure>
    </div>
    <div class="wrap-selector" aria-label="Choose a triangle">
      ${Array.from({length:5},(_,cell)=>`<div class="wrap-cell" style="--cell:${colors[cell]}"><span>Cell ${cell+1}</span>${[0,1].map(kind=>`<button type="button" data-wrap-pick="${cell*2+kind}" aria-pressed="false" aria-label="Cell ${cell+1}, triangle ${kind+1}">T${kind+1}</button>`).join('')}</div>`).join('')}
    </div>
    <output class="wrap-inspector" aria-live="polite" id="wrap-inspector"></output>
    <div class="wrap-collision"><strong>Two distinct interior points.</strong> a = ${coordinates(a.before)}, b = ${coordinates(b.before)}, and Φ(a) = Φ(b) = ${coordinates(a.after)}. Both use barycentric weights ${mesh.weights.join(', ')} in their respective T1 triangles.</div>
    <details class="math-detail wrap-notes"><summary>Construction and mathematical qualifications</summary>
      <div class="detail-content">
        <p>Write A<sub>j</sub> = (j, 0) and B<sub>j</sub> = (j, 1). With θ<sub>j</sub> = −jπ/2, the images of A<sub>j</sub> and B<sub>j</sub> have radii 1 and 2, respectively, at angle θ<sub>j</sub>. We extend affinely on (A<sub>j</sub>, A<sub>j+1</sub>, B<sub>j+1</sub>) and (A<sub>j</sub>, B<sub>j+1</sub>, B<sub>j</sub>). Adjacent triangles agree on shared edges because the edge maps are affine with the same endpoint images.</p>
        <p><strong>Proposition 1 still applies under its stated hypothesis.</strong> Writing Φ = Id + Δt w<sub>h</sub> for this example, the collision gives Δt |w<sub>h</sub>(a) − w<sub>h</sub>(b)| = |a − b|, so Δt |w<sub>h</sub>|<sub>Lip, Ω</sub> ≥ 1 and the strict restriction fails.</p>
        <p>Under suitable boundary and topological hypotheses, element orientation can yield global injectivity. For example, Lipman’s theorem for nondegenerate, orientation-preserving simplicial maps of manifold meshes uses a bijective map to the boundary of the target polytope. In 1D, a continuous piecewise-affine map with strictly positive slopes is strictly increasing. Global non-overlap, orientation and uniform shape regularity remain distinct properties.</p>
        <p><a href="${source}" target="_blank" rel="noopener noreferrer">Yaron Lipman, Bijective Mappings of Meshes with Boundary and the Degree in Mesh Processing, SIAM Journal on Imaging Sciences (2014)</a></p>
      </div>
    </details>
  </dialog>`;
}

export function meshWrapInspection(triangle) {
  return `<strong>Cell ${triangle.cell+1} · T${triangle.kind+1}</strong> <span>Ordered vertices ${esc(triangle.vertices.map(v=>v.name).join(' → '))}</span> <span>det E before = ${fmt(triangle.before)} · det E after = ${fmt(triangle.after)}</span>`;
}
