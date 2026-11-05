// fast 先走 k 步，之後 fast、slow 一起走；fast 到尾時 slow.next 就是倒數第 k 個
function removeKthFromEnd(head, k) {
  const dummy = { val: 0, next: head };
  let fast = dummy, slow = dummy;
  for (let i = 0; i < k; i++) fast = fast.next;
  while (fast.next) { fast = fast.next; slow = slow.next; }
  const removed = slow.next.val;
  slow.next = slow.next.next;
  return [dummy.next, removed];
}

const [head, removed] = removeKthFromEnd([10, 20, 30, 40, 50, 60, 70].reduceRight((next, val) => ({ val, next }), null), 3);
const out = [];
for (let p = head; p; p = p.next) out.push(p.val);
console.log(`removed ${removed} :`, out.join(' -> '));
