const build = (vals) => vals.reduceRight((next, val) => ({ val, next }), null);

// 用虛擬頭節點 dummy；每次把較小的節點接到尾端
function merge(a, b) {
  const dummy = { val: 0, next: null };
  let tail = dummy;
  while (a && b) {
    if (a.val <= b.val) { tail.next = a; a = a.next; }
    else { tail.next = b; b = b.next; }
    tail = tail.next;
  }
  tail.next = a || b;
  return dummy.next;
}

const out = [];
for (let h = merge(build([1, 4, 7, 10, 15]), build([2, 3, 8, 12, 20, 25])); h; h = h.next) out.push(h.val);
console.log(out.join(' -> '));
