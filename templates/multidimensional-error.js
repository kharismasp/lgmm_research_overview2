const regularity = '<mtext><button class="term-link z3-link" type="button" data-term="multidimensional-z3" aria-label="Definition of Z cubed" aria-expanded="false">Z<sup>3</sup></button></mtext>';
const phi = '<mi>φ</mi>';
const phiH = `<msub>${phi}<mi>h</mi></msub>`;
const totalError = `${phiH}<mo>−</mo>${phi}`;

function norm(operand, space) {
  return `<msub><mrow><mo stretchy="false">∥</mo>${operand}<mo stretchy="false">∥</mo></mrow>${space}</msub>`;
}

function sequenceNorm(operand, order) {
  return norm(operand, `<mrow><msup><mi>ℓ</mi>${order}</msup><mo>(</mo><msup><mi>L</mi><mn>2</mn></msup><mo>)</mo></mrow>`);
}

export function multidimensionalErrorEstimate() {
  const gradient = sequenceNorm(`<mo>∇</mo><mo>(</mo>${totalError}<mo>)</mo>`, '<mn>2</mn>');
  const solutionNorm = norm(phi, regularity);
  return `<article class="theorem-box error-theorem readable-theorem multidim-estimate" aria-labelledby="multidim-estimate-title">
    <header><span id="multidim-estimate-title">Multi-D · Second-order error estimates</span><strong>Manuscript result</strong></header>
    <div class="theorem-body">
      <p>Let φ<sub>h</sub> solve the second-order LGMM scheme with φ<sub>h</sub><sup>0</sup> = Π<sub>h</sub><sup>0</sup>φ<sup>0</sup> and
        <math><mrow>${phi}<mo>∈</mo>${regularity}</mrow></math>. Here Π<sub>h</sub> is the moving elliptic projection. The constant C is independent of h and Δt.</p>
      <div class="multidim-estimate-line">
        <p>Total approximation error</p>
        <div class="multidim-equation">
          <math><mrow>${sequenceNorm(totalError, '<mi>∞</mi>')}</mrow></math>
          <math><mrow><mo>+</mo><msqrt><mi>ν</mi></msqrt>${gradient}</mrow></math>
          <math><mrow><mo>≤</mo><mi>C</mi><mo>(</mo><mi mathvariant="normal">Δ</mi><msup><mi>t</mi><mn>2</mn></msup><mo>+</mo><mi>h</mi><mo>)</mo><mspace width=".18em"/>${solutionNorm}</mrow></math>
        </div>
      </div>
      <div class="multidim-assumptions">
        <h4>Assumptions on the domain, velocities, and mesh</h4>
        <ul>
          <li>Ω is a bounded convex polygon or polyhedron (d = 2 or 3). The physical velocity u belongs to C([0,T]; W<sup>1,∞</sup><sub>0</sub>(Ω)<sup>d</sup>). The time step satisfies Δt &lt; 1 and Δt |u|<sub>C(W<sup>1,∞</sup>)</sub> ≤ 1/8.</li>
          <li>The nodal points form a moving mesh. For every element and t ∈ [0,t<sup>N<sub>T</sub></sup>], h<sub>K</sub>/ρ<sub>K</sub> ≤ σ, ‖w<sub>h</sub>‖<sub>L<sup>∞</sup>(0,t<sup>N<sub>T</sub></sup>; W<sup>1,∞</sup>)</sub> ≤ C<sub>W</sub>, and Δt C<sub>W</sub> ≤ 1/4.</li>
          <li>There is a velocity w ∈ L<sup>∞</sup>(0,T; W<sup>2,∞</sup>(Ω)<sup>d</sup>) with ‖w‖<sub>L<sup>∞</sup>(0,T; W<sup>2,∞</sup>)</sub> ≤ C<sub>W</sub> and ‖w<sub>h</sub>−w‖<sub>L<sup>∞</sup>(0,t<sup>N<sub>T</sub></sup>; W<sup>1,∞</sup>)</sub> ≤ C<sub>W</sub>h. The mesh constants σ ≥ 1 and C<sub>W</sub> &gt; 0 are independent of h and Δt.</li>
        </ul>
      </div>
    </div>
  </article>`;
}
