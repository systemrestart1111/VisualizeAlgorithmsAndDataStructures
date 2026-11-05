// 固定大小的環狀緩衝區：head、tail 走到陣列尾端就繞回 0，空間可重複使用
class CircularQueue {
  constructor(cap) { this.buf = new Array(cap).fill(null); this.head = 0; this.size = 0; }
  enqueue(v) {
    if (this.size === this.buf.length) return false; // 已滿
    this.buf[(this.head + this.size) % this.buf.length] = v;
    this.size++;
    return true;
  }
  dequeue() {
    const v = this.buf[this.head];
    this.buf[this.head] = null;
    this.head = (this.head + 1) % this.buf.length;
    this.size--;
    return v;
  }
  toString() { return `buffer [${this.buf.map((x) => (x === null ? '.' : x)).join(' ')}] head=${this.head} size=${this.size}`; }
}

const q = new CircularQueue(5);
for (const v of [1, 2, 3, 4]) q.enqueue(v);
console.log('enqueue 1..4:  ' + q);
const a = q.dequeue(), b = q.dequeue();
console.log(`dequeue -> ${a} ${b}  ${q}`);
for (const v of [5, 6, 7]) console.log(`enqueue ${v}: ${q.enqueue(v) ? 'ok  ' : 'full'} ${q}`);
console.log(`dequeue -> ${q.dequeue()}  ${q}`);
