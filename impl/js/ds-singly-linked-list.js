// 每個節點只記得下一個；頭部插入刪除 O(1)，找特定位置要從頭走 O(n)
class SinglyLinkedList {
  constructor() { this.head = null; this.size = 0; }
  pushFront(v) { this.head = { val: v, next: this.head }; this.size++; }
  pushBack(v) {
    if (!this.head) return this.pushFront(v);
    let cur = this.head;
    while (cur.next) cur = cur.next;
    cur.next = { val: v, next: null };
    this.size++;
  }
  // 刪除第一個值為 v 的節點：讓前一個節點跳過它
  remove(v) {
    let prev = null, cur = this.head;
    while (cur && cur.val !== v) { prev = cur; cur = cur.next; }
    if (!cur) return false;
    if (prev) prev.next = cur.next;
    else this.head = cur.next;
    this.size--;
    return true;
  }
  find(v) {
    let i = 0;
    for (let cur = this.head; cur; cur = cur.next, i++) if (cur.val === v) return i;
    return -1;
  }
  toString() {
    const out = [];
    for (let cur = this.head; cur; cur = cur.next) out.push(cur.val);
    return [...out, 'null'].join(' -> ');
  }
}

const l = new SinglyLinkedList();
for (const v of [3, 7, 1]) l.pushBack(v);
console.log('init:         ' + l);
l.pushFront(9); console.log('push_front 9: ' + l);
l.pushBack(4); console.log('push_back 4:  ' + l);
const ok = l.remove(7);
console.log(`remove 7:     ${ok ? 'True' : 'False'} ${l}`);
console.log(`find 1 -> ${l.find(1)}  find 8 -> ${l.find(8)}  size = ${l.size}`);
