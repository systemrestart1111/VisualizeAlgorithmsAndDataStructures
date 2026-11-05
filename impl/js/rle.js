// 把連續重複的字元壓成「次數 + 字元」
const rleEncode = (s) => s.replace(/(.)\1*/g, (run, ch) => `${run.length}${ch}`);
const rleDecode = (code) => code.replace(/(\d+)(\D)/g, (_, n, ch) => ch.repeat(Number(n)));

const s = 'WWWWWWWWWWWWBWWWWWWWWWWWWBBBWWWWWWWWWWWWWWWWWWWWWWWWBWWWWWWWWWWWWWW';
const code = rleEncode(s);
console.log('encoded:', code);
console.log(`length ${s.length} -> ${code.length}, decode ok: ${rleDecode(code) === s ? 'True' : 'False'}`);
