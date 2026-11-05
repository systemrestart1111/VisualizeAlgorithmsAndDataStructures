public class ReverseLinkedList {
    static class Node {
        int val;
        Node next;
        Node(int v, Node n) { val = v; next = n; }
    }

    // 三個指標 prev / cur / nxt：逐一把 cur.next 改指向前一個節點
    static Node reverse(Node head) {
        Node prev = null, cur = head;
        while (cur != null) {
            Node nxt = cur.next;
            cur.next = prev;
            prev = cur;
            cur = nxt;
        }
        return prev;
    }

    public static void main(String[] args) {
        Node head = null;
        for (int v = 6; v >= 1; v--) head = new Node(v, head);
        head = reverse(head);
        StringBuilder sb = new StringBuilder();
        for (Node p = head; p != null; p = p.next) sb.append(p.val).append(p.next != null ? " -> " : "");
        System.out.println(sb);
    }
}
