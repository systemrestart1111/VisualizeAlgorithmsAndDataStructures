// 每個節點同時記得前後；有 head 與 tail，兩端插入刪除都是 O(1)，也能反向走訪
class DoublyLinkedList {
  constructor() { this.head = this.tail = null; }
  pushFront(v) {
    const n = { val: v, prev: null, next: this.head };
    if (this.head) this.head.prev = n; else this.tail = n;
    this.head = n;
  }
  pushBack(v) {
    const n = { val: v, prev: this.tail, next: null };
    if (this.tail) this.tail.next = n; else this.head = n;
    this.tail = n;
  }
  // 把節點 n 從前後鄰居之間拿掉
  unlink(n) {
    if (n.prev) n.prev.next = n.next; else this.head = n.next;
    if (n.next) n.next.prev = n.prev; else this.tail = n.prev;
    return n.val;
  }
  popFront() { return this.unlink(this.head); }
  popBack() { return this.unlink(this.tail); }
  remove(v) {
    let cur = this.head;
    while (cur && cur.val !== v) cur = cur.next;
    if (!cur) return false;
    this.unlink(cur);
    return true;
  }
  toString() {
    const fwd = [], bwd = [];
    for (let c = this.head; c; c = c.next) fwd.push(c.val);
    for (let c = this.tail; c; c = c.prev) bwd.push(c.val);
    return `${fwd.join(' <-> ') || '(empty)'}   | backward: ${bwd.join(' ')}`;
  }
}

const d = new DoublyLinkedList();
for (const v of [10, 20, 30]) d.pushBack(v);
console.log('init:          ' + d);
d.pushFront(5); console.log('push_front 5:  ' + d);
d.pushBack(40); console.log('push_back 40:  ' + d);
let v = d.popFront(); console.log(`pop_front -> ${v} ${d}`);
v = d.popBack(); console.log(`pop_back  -> ${v} ${d}`);
const ok = d.remove(20); console.log(`remove 20:     ${ok ? 'True' : 'False'} ${d}`);
