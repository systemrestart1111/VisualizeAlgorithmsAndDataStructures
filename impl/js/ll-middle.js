// 快慢指標：fast 一次走兩步、slow 一次走一步，fast 到尾時 slow 在中點
function middle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}

const head = [3, 7, 1, 9, 4, 8, 2].reduceRight((next, val) => ({ val, next }), null);
console.log('middle =', middle(head).val);
