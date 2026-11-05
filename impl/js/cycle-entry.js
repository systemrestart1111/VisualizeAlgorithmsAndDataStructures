// 相遇後把一個指標放回起點，兩者都改成一次一步，再次相遇處就是環的入口
function cycleEntry(head) {
  let slow = head, fast = head;
  for (;;) {
    if (!fast || !fast.next) return [null, 0];
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) break;
  }
  let p = head;
  while (p !== slow) { p = p.next; slow = slow.next; }
  let length = 1;
  for (let q = p.next; q !== p; q = q.next) length++;
  return [p, length];
}

const nodes = [3, 8, 1, 6, 9, 4, 7, 2, 5].map((val) => ({ val, next: null }));
nodes.forEach((n, i) => (n.next = nodes[i + 1] ?? nodes[3]));
const [e, length] = cycleEntry(nodes[0]);
console.log('entry =', e.val, 'cycle length =', length);
