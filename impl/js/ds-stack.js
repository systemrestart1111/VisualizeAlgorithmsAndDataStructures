// 後進先出（LIFO）：只在頂端 push / pop，都是 O(1)
class Stack {
  constructor() { this.items = []; }
  push(v) { this.items.push(v); }
  pop() { return this.items.pop(); }
  peek() { return this.items[this.items.length - 1]; }
  toString() { return `bottom [${this.items.join(' ')}] top`; }
}

const s = new Stack();
for (const v of [4, 8, 15]) { s.push(v); console.log(`push ${String(v).padStart(2)}: ${s}`); }
console.log('peek ->', s.peek());
for (let i = 0; i < 2; i++) { const v = s.pop(); console.log(`pop -> ${v}: ${s}`); }
s.push(16); console.log('push 16: ' + s);
