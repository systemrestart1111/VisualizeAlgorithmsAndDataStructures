public class SinglyLinkedListDemo {
    // 每個節點只記得下一個；頭部插入刪除 O(1)，找特定位置要從頭走 O(n)
    static class SinglyLinkedList {
        static class Node {
            int val;
            Node next;
            Node(int v, Node n) { val = v; next = n; }
        }

        Node head;
        int size;

        void pushFront(int v) { head = new Node(v, head); size++; }

        void pushBack(int v) {
            if (head == null) { pushFront(v); return; }
            Node cur = head;
            while (cur.next != null) cur = cur.next;
            cur.next = new Node(v, null);
            size++;
        }

        // 刪除第一個值為 v 的節點：讓前一個節點跳過它
        boolean remove(int v) {
            Node prev = null, cur = head;
            while (cur != null && cur.val != v) { prev = cur; cur = cur.next; }
            if (cur == null) return false;
            if (prev != null) prev.next = cur.next;
            else head = cur.next;
            size--;
            return true;
        }

        int find(int v) {
            int i = 0;
            for (Node cur = head; cur != null; cur = cur.next, i++) if (cur.val == v) return i;
            return -1;
        }

        public String toString() {
            StringBuilder sb = new StringBuilder();
            for (Node cur = head; cur != null; cur = cur.next) sb.append(cur.val).append(" -> ");
            return sb.append("null").toString();
        }
    }

    public static void main(String[] args) {
        SinglyLinkedList l = new SinglyLinkedList();
        for (int v : new int[] {3, 7, 1}) l.pushBack(v);
        System.out.println("init:         " + l);
        l.pushFront(9); System.out.println("push_front 9: " + l);
        l.pushBack(4); System.out.println("push_back 4:  " + l);
        boolean ok = l.remove(7);
        System.out.println("remove 7:     " + (ok ? "True" : "False") + " " + l);
        System.out.println("find 1 -> " + l.find(1) + "  find 8 -> " + l.find(8) + "  size = " + l.size);
    }
}
