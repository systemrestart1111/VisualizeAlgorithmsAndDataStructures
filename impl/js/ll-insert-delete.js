const build = (vals) => vals.reduceRight((next, val) => ({ val, next }), null);
function toStr(h) {
  const out = [];
  for (; h; h = h.next) out.push(h.val);
  return out.join(' -> ');
}

// 在位置 i 插入：找到第 i-1 個節點，新節點先接上後繼，再讓前驅指向新節點
function insertAt(head, i, v) {
  if (i === 0) return { val: v, next: head };
  let prev = head;
  for (let k = 0; k < i - 1; k++) prev = prev.next;
  prev.next = { val: v, next: prev.next };
  return head;
}

// 刪除位置 i：讓前驅直接跳過該節點
function deleteAt(head, i) {
  if (i === 0) return head.next;
  let prev = head;
  for (let k = 0; k < i - 1; k++) prev = prev.next;
  prev.next = prev.next.next;
  return head;
}

let head = build([10, 20, 30, 40, 50]);
head = insertAt(head, 2, 99);
console.log('insert 99 at 2:', toStr(head));
head = deleteAt(head, 4);
console.log('delete at 4:  ', toStr(head));
