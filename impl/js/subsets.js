// 每個節點都是一個子集合：輸出目前的集合，再嘗試從 start 之後加入下一個元素
function subsets(items) {
  const out = [], cur = [];
  (function bt(start) {
    out.push([...cur]);
    for (let i = start; i < items.length; i++) {
      cur.push(items[i]);
      bt(i + 1);
      cur.pop();
    }
  })(0);
  return out;
}

const res = subsets(['a', 'b', 'c']);
for (const s of res) console.log(`{${s.join(' ')}}`);
console.log('count =', res.length);
