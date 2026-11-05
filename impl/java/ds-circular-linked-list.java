public class CircularLinkedListDemo {
    // 尾節點的 next 指回頭節點；只要記住 tail，就能 O(1) 取得頭（tail.next）並在兩端插入
    static class CircularLinkedList {
        static class Node {
            int val;
            Node next;
            Node(int v) { val = v; }
        }

        Node tail;

        void insertBack(int v) {
            Node n = new Node(v);
            if (tail == null) n.next = n;
            else { n.next = tail.next; tail.next = n; }
            tail = n;
        }

        boolean remove(int v) {
            if (tail == null) return false;
            Node prev = tail, cur = tail.next;
            do {
                if (cur.val == v) {
                    if (cur == prev) tail = null; // 只剩一個節點
                    else {
                        prev.next = cur.next;
                        if (cur == tail) tail = prev;
                    }
                    return true;
                }
                prev = cur;
                cur = cur.next;
            } while (cur != tail.next);
            return false;
        }

        // 把頭移到尾：只要 tail 往前走一步
        void rotate() { if (tail != null) tail = tail.next; }

        public String toString() {
            if (tail == null) return "(empty)";
            StringBuilder sb = new StringBuilder();
            for (Node cur = tail.next;; cur = cur.next) {
                sb.append(cur.val).append(" -> ");
                if (cur == tail) break;
            }
            return sb.append("(back to ").append(tail.next.val).append(')').toString();
        }
    }

    public static void main(String[] args) {
        CircularLinkedList c = new CircularLinkedList();
        for (int v = 1; v <= 4; v++) c.insertBack(v);
        System.out.println("init:       " + c);
        c.rotate(); System.out.println("rotate:     " + c);
        boolean ok = c.remove(3); System.out.println("remove 3:   " + (ok ? "True" : "False") + " " + c);
        ok = c.remove(2); System.out.println("remove 2:   " + (ok ? "True" : "False") + " " + c);
        c.insertBack(5); System.out.println("insert 5:   " + c);
    }
}
