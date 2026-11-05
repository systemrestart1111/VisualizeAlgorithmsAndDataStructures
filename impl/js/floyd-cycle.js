function buildWithCycle(vals, pos) {
  const nodes = vals.map((val) => ({ val, next: null }));
  nodes.forEach((n, i) => (n.next = nodes[i + 1] ?? null));
  if (pos >= 0) nodes[nodes.length - 1].next = nodes[pos]; // 尾端接回第 pos 個節點形成環
  return nodes[0];
}

// 龜兔賽跑：兔子一次兩步、烏龜一次一步；有環時兩者必定相遇
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return `(True, ${slow.val})`;
  }
  return '(False, None)';
}

const vals = [3, 8, 1, 6, 9, 4, 7, 2, 5];
console.log('pos 3:', hasCycle(buildWithCycle(vals, 3)));
console.log('pos -1:', hasCycle(buildWithCycle(vals, -1)));
