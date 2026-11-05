public class DoublyLinkedListDemo {
    // 每個節點同時記得前後；有 head 與 tail，兩端插入刪除都是 O(1)，也能反向走訪
    static class DoublyLinkedList {
        static class Node {
            int val;
            Node prev, next;
            Node(int v) { val = v; }
        }

        Node head, tail;

        void pushFront(int v) {
            Node n = new Node(v);
            n.next = head;
            if (head != null) head.prev = n; else tail = n;
            head = n;
        }

        void pushBack(int v) {
            Node n = new Node(v);
            n.prev = tail;
            if (tail != null) tail.next = n; else head = n;
            tail = n;
        }

        // 把節點 n 從前後鄰居之間拿掉
        int unlink(Node n) {
            if (n.prev != null) n.prev.next = n.next; else head = n.next;
            if (n.next != null) n.next.prev = n.prev; else tail = n.prev;
            return n.val;
        }

        int popFront() { return unlink(head); }
        int popBack() { return unlink(tail); }

        boolean remove(int v) {
            Node cur = head;
            while (cur != null && cur.val != v) cur = cur.next;
            if (cur == null) return false;
            unlink(cur);
            return true;
        }

        public String toString() {
            StringBuilder sb = new StringBuilder(head == null ? "(empty)" : "");
            for (Node c = head; c != null; c = c.next) sb.append(c.val).append(c.next != null ? " <-> " : "");
            sb.append("   | backward:");
            for (Node c = tail; c != null; c = c.prev) sb.append(' ').append(c.val);
            return sb.toString();
        }
    }

    public static void main(String[] args) {
        DoublyLinkedList d = new DoublyLinkedList();
        for (int v : new int[] {10, 20, 30}) d.pushBack(v);
        System.out.println("init:          " + d);
        d.pushFront(5); System.out.println("push_front 5:  " + d);
        d.pushBack(40); System.out.println("push_back 40:  " + d);
        int v = d.popFront(); System.out.println("pop_front -> " + v + " " + d);
        v = d.popBack(); System.out.println("pop_back  -> " + v + " " + d);
        boolean ok = d.remove(20); System.out.println("remove 20:     " + (ok ? "True" : "False") + " " + d);
    }
}
