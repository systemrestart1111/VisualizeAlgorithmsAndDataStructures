const matmul = (A, B) => A.map((row) => B[0].map((_, j) => row.reduce((s, x, k) => s + x * B[k][j], 0)));
const transpose = (A) => A[0].map((_, j) => A.map((r) => r[j]));
// 第 0 列餘因子展開
const det = (A) => (A.length === 1 ? A[0][0] : A[0].reduce((s, x, j) => s + (j % 2 ? -1 : 1) * x * det(A.slice(1).map((r) => r.filter((_, k) => k !== j))), 0));
const str = (M) => '[' + M.map((r) => '[' + r.join(', ') + ']').join(', ') + ']';

const A = [[1, 2], [3, 4]], B = [[5, 6], [7, 8]];
console.log('AB =', str(matmul(A, B)));
console.log('BA =', str(matmul(B, A)));
console.log('A^T =', str(transpose(A)));
console.log('det(A) =', det(A));
console.log('det([[2,0,1],[1,3,2],[1,1,1]]) =', det([[2, 0, 1], [1, 3, 2], [1, 1, 1]]));
