// 先進先出（FIFO）：用鏈結串列，從尾端 enqueue、從頭端 dequeue，都是 O(1)
// （直接用 Array.shift() 是 O(n)，資料多時會很慢）
class Queue {
  constructor() { this.head = this.tail = null; }
  enqueue(v) {
    const n = { val: v, next: null };
    if (this.tail) this.tail.next = n; else this.head = n;
    this.tail = n;
  }
  dequeue() {
    const n = this.head;
    this.head = n.next;
    if (!this.head) this.tail = null;
    return n.val;
  }
  toString() {
    const out = [];
    for (let c = this.head; c; c = c.next) out.push(c.val);
    return `front [${out.join(' ')}] rear`;
  }
}

const q = new Queue();
for (const v of ['A', 'B', 'C']) { q.enqueue(v); console.log(`enqueue ${v}: ${q}`); }
let v = q.dequeue(); console.log(`dequeue -> ${v}: ${q}`);
q.enqueue('D'); console.log('enqueue D: ' + q);
v = q.dequeue(); console.log(`dequeue -> ${v}: ${q}`);
