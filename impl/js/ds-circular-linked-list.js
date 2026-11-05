// 尾節點的 next 指回頭節點；只要記住 tail，就能 O(1) 取得頭（tail.next）並在兩端插入
class CircularLinkedList {
  constructor() { this.tail = null; }
  insertBack(v) {
    const n = { val: v, next: null };
    if (!this.tail) n.next = n;
    else { n.next = this.tail.next; this.tail.next = n; }
    this.tail = n;
  }
  remove(v) {
    if (!this.tail) return false;
    let prev = this.tail, cur = this.tail.next;
    do {
      if (cur.val === v) {
        if (cur === prev) this.tail = null; // 只剩一個節點
        else {
          prev.next = cur.next;
          if (cur === this.tail) this.tail = prev;
        }
        return true;
      }
      prev = cur;
      cur = cur.next;
    } while (cur !== this.tail.next);
    return false;
  }
  // 把頭移到尾：只要 tail 往前走一步
  rotate() { if (this.tail) this.tail = this.tail.next; }
  toString() {
    if (!this.tail) return '(empty)';
    const out = [];
    for (let cur = this.tail.next; ; cur = cur.next) {
      out.push(cur.val);
      if (cur === this.tail) break;
    }
    return `${out.join(' -> ')} -> (back to ${this.tail.next.val})`;
  }
}

const c = new CircularLinkedList();
for (const v of [1, 2, 3, 4]) c.insertBack(v);
console.log('init:       ' + c);
c.rotate(); console.log('rotate:     ' + c);
let ok = c.remove(3); console.log(`remove 3:   ${ok ? 'True' : 'False'} ${c}`);
ok = c.remove(2); console.log(`remove 2:   ${ok ? 'True' : 'False'} ${c}`);
c.insertBack(5); console.log('insert 5:   ' + c);
