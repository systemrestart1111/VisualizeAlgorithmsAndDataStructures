// (A - O) × (B - O)：> 0 表示 B 在 OA 左側（逆時針），< 0 在右側，= 0 共線
const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

const O = [2, 2], A = [8, 4];
for (const B of [[4, 8], [9, 1], [5, 3], [11, 5]]) {
  const c = cross(O, A, B);
  const side = c > 0 ? 'left (counter-clockwise)' : c < 0 ? 'right (clockwise)' : 'collinear';
  console.log(`B=${B[0]},${B[1]}: cross = ${String(c).padStart(4)} -> ${side}`);
}
