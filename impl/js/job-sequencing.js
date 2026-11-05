const JOBS = [[2, 100], [1, 19], [2, 27], [1, 25], [3, 15], [3, 40], [4, 30]]; // (截止時間, 利潤)

// 依利潤由高到低考慮；每份工作排進「截止前最晚的空時段」，讓前面的時段留給截止較早的工作
const maxD = Math.max(...JOBS.map((j) => j[0]));
const slot = new Array(maxD + 1).fill(null);
let total = 0;
for (const i of JOBS.map((_, i) => i).sort((a, b) => JOBS[b][1] - JOBS[a][1]))
  for (let t = JOBS[i][0]; t >= 1; t--)
    if (slot[t] === null) { slot[t] = i; total += JOBS[i][1]; break; }
for (let t = 1; t <= maxD; t++) console.log(`slot ${t}:`, slot[t] !== null ? `J${slot[t] + 1} (profit ${JOBS[slot[t]][1]})` : '-');
console.log('total profit =', total);
