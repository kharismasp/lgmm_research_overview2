const vertexAt = (column, row) => ({column, row, name: `${row ? 'B' : 'A'}${column}`});
const snap = x => Math.abs(x - Math.round(x)) < 1e-12 ? Math.round(x) + 0 : x;
const det = ([p,q,r]) => (q[0]-p[0])*(r[1]-p[1]) - (q[1]-p[1])*(r[0]-p[0]);

export function makeMeshWrap() {
  const vertices = Array.from({length:12}, (_,i) => {
    const vertex = vertexAt(Math.floor(i/2),i%2);
    const theta = -vertex.column * Math.PI / 2;
    const radius = 1 + vertex.row;
    return {...vertex,
      before:[vertex.column,vertex.row],
      after:[snap(radius*Math.cos(theta)),snap(radius*Math.sin(theta))]
    };
  });
  const triangles = Array.from({length:5}, (_,cell) => {
    const a = 2*cell, b = a+1;
    return [[a,a+2,b+2],[a,b+2,b]].map((indices,kind) => {
      const ordered = indices.map(index => vertices[index]);
      return {cell, kind, vertices:ordered, before:det(ordered.map(v=>v.before)), after:det(ordered.map(v=>v.after))};
    });
  }).flat();
  const weights = [.25,.4,.35];
  const points = [triangles[0],triangles[8]].map((triangle,i) => {
    const combine = frame => [0,1].map(coordinate => triangle.vertices.reduce(
      (sum,vertex,index)=>sum+weights[index]*vertex[frame][coordinate],0
    ));
    return {label:i ? 'b' : 'a',before:combine('before'),after:combine('after')};
  });
  return {vertices,triangles,points,weights};
}
