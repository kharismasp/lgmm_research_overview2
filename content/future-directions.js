export const futureDirectionsCopy = {
  en:{
    label:'Future directions',
    heading:'Moving meshes for evolving sharp structures',
    status:'The 1D error estimates are published. The multidimensional error analysis is complete under prescribed mesh assumptions, and the manuscript is in preparation. Whether the nodal law maintains the needed mesh quality remains open.',
    theory:'Mathematical foundations',
    theoryItems:[
      'Mesh geometry and quality in multiple dimensions',
      'Approximation and error estimates on evolving finite element spaces',
      'Solution-dependent mesh velocities and extensions to nonlinear and coupled PDEs'
    ],
    geometry:'Schematic: a simplex can become slender while keeping its area.',
    applications:'Interdisciplinary collaboration',
    resolution:'Where should the mesh concentrate as the solution evolves?',
    examples:[
      ['Mathematical biology','Cell aggregation, chemotaxis and invasion fronts'],
      ['Fluid, environmental and disaster-related transport','Localized concentrations and moving fronts'],
      ['Geometric evolution','Moving interfaces, evolving curves and mesh redistribution']
    ],
    scope:'These problems are candidates for collaboration and method extension. Each requires its own mesh model and analysis.',
    closing:'My research focuses on developing and analyzing moving mesh methods for PDEs with evolving sharp structures, with particular emphasis on rigorous error estimates.'
  },
  ja:{
    label:'今後の研究',
    heading:'移動する急峻な構造のための移動メッシュ法',
    status:'一次元の誤差評価は公表済みである。多次元の誤差解析は所定のメッシュ条件の下で完了し、論文を準備中である。節点移動則が必要なメッシュ品質を保つかどうかは未解決である。',
    theory:'数理的基礎',
    theoryItems:['多次元のメッシュの幾何と品質','時間とともに変化する有限要素空間での近似と誤差評価','解に依存するメッシュ速度と非線形・連成偏微分方程式への拡張'],
    geometry:'模式図：面積が一定でも要素は細長くなり得る。',
    applications:'分野横断的な共同研究',
    resolution:'解が時間とともに変化するとき、どこにメッシュを集中させるか。',
    examples:[
      ['数理生物学','細胞凝集、走化性、浸潤フロント'],
      ['流体・環境・防災に関わる輸送','局在する濃度分布や移動するフロント'],
      ['幾何学的発展','移動界面、曲線の発展、メッシュの再配分']
    ],
    scope:'いずれも共同研究と手法の拡張の候補であり、問題ごとにメッシュの設定と解析が必要である。',
    closing:'移動する急峻な構造を持つ偏微分方程式に対し、移動メッシュ法の開発と数理解析、とりわけ厳密な誤差評価に取り組んでいる。'
  }
};
