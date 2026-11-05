public class QueueDemo {
    // 先進先出（FIFO）：用鏈結串列，從尾端 enqueue、從頭端 dequeue，都是 O(1)
    static class Queue {
        static class Node {
            String val;
            Node next;
            Node(String v) { val = v; }
        }

        Node head, tail;

        void enqueue(String v) {
            Node n = new Node(v);
            if (tail != null) tail.next = n; else head = n;
            tail = n;
        }

        String dequeue() {
            Node n = head;
            head = n.next;
            if (head == null) tail = null;
            return n.val;
        }

        public String toString() {
            StringBuilder sb = new StringBuilder("front [");
            for (Node c = head; c != null; c = c.next) sb.append(c == head ? "" : " ").append(c.val);
            return sb.append("] rear").toString();
        }
    }

    public static void main(String[] args) {
        Queue q = new Queue();
        for (String v : new String[] {"A", "B", "C"}) { q.enqueue(v); System.out.println("enqueue " + v + ": " + q); }
        String v = q.dequeue(); System.out.println("dequeue -> " + v + ": " + q);
        q.enqueue("D"); System.out.println("enqueue D: " + q);
        v = q.dequeue(); System.out.println("dequeue -> " + v + ": " + q);
    }
}
