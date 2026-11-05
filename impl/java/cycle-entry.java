public class CycleEntry {
    static class Node {
        int val;
        Node next;
        Node(int v) { val = v; }
    }

    static int length;

    // 相遇後把一個指標放回起點，兩者都改成一次一步，再次相遇處就是環的入口
    static Node cycleEntry(Node head) {
        Node slow = head, fast = head;
        for (;;) {
            if (fast == null || fast.next == null) { length = 0; return null; }
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) break;
        }
        Node p = head;
        while (p != slow) { p = p.next; slow = slow.next; }
        length = 1;
        for (Node q = p.next; q != p; q = q.next) length++;
        return p;
    }

    public static void main(String[] args) {
        int[] vals = {3, 8, 1, 6, 9, 4, 7, 2, 5};
        Node[] nodes = new Node[vals.length];
        for (int i = 0; i < vals.length; i++) nodes[i] = new Node(vals[i]);
        for (int i = 0; i < vals.length; i++) nodes[i].next = i + 1 < vals.length ? nodes[i + 1] : nodes[3];
        Node e = cycleEntry(nodes[0]);
        System.out.println("entry = " + e.val + " cycle length = " + length);
    }
}
