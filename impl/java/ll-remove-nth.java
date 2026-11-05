public class RemoveKthFromEnd {
    static class Node {
        int val;
        Node next;
        Node(int v, Node n) { val = v; next = n; }
    }

    static int removed;

    // fast 先走 k 步，之後 fast、slow 一起走；fast 到尾時 slow.next 就是倒數第 k 個
    static Node removeKthFromEnd(Node head, int k) {
        Node dummy = new Node(0, head), fast = dummy, slow = dummy;
        for (int i = 0; i < k; i++) fast = fast.next;
        while (fast.next != null) { fast = fast.next; slow = slow.next; }
        removed = slow.next.val;
        slow.next = slow.next.next;
        return dummy.next;
    }

    public static void main(String[] args) {
        Node head = null;
        for (int v = 70; v >= 10; v -= 10) head = new Node(v, head);
        head = removeKthFromEnd(head, 3);
        StringBuilder sb = new StringBuilder("removed " + removed + " : ");
        for (Node p = head; p != null; p = p.next) sb.append(p.val).append(p.next != null ? " -> " : "");
        System.out.println(sb);
    }
}
