public class ListIntersection {
    static class Node {
        int val;
        Node next;
        Node(int v, Node n) { val = v; next = n; }
    }

    static Node build(Node tail, int... v) {
        Node head = tail;
        for (int i = v.length - 1; i >= 0; i--) head = new Node(v[i], head);
        return head;
    }

    // 兩指標各走自己的串列，走到尾就跳到另一條的開頭；兩者走過的總長相同，會在交點相遇
    static Node intersection(Node a, Node b) {
        Node p = a, q = b;
        while (p != q) {
            p = p != null ? p.next : b;
            q = q != null ? q.next : a;
        }
        return p;
    }

    public static void main(String[] args) {
        Node common = build(null, 8, 10, 12);
        Node node = intersection(build(common, 4, 1, 7), build(common, 5, 6, 2, 9, 3));
        System.out.println("intersection at " + (node != null ? String.valueOf(node.val) : "None"));
    }
}
