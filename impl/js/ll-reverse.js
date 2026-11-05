// 三個指標 prev / cur / nxt：逐一把 cur.next 改指向前一個節點
function reverse(head) {
  let prev = null, cur = head;
  while (cur) {
    const nxt = cur.next;
    cur.next = prev;
    prev = cur;
    cur = nxt;
  }
  return prev;
}

let head = [1, 2, 3, 4, 5, 6].reduceRight((next, val) => ({ val, next }), null);
head = reverse(head);
const out = [];
for (let p = head; p; p = p.next) out.push(p.val);
console.log(out.join(' -> '));
