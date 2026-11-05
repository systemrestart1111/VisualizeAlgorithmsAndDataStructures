public class MergeSortedLists {
    static class Node {
        int val;
        Node next;
        Node(int v, Node n) { val = v; next = n; }
    }

    static Node build(int... v) {
        Node head = null;
        for (int i = v.length - 1; i >= 0; i--) head = new Node(v[i], head);
        return head;
    }

    // 用虛擬頭節點 dummy；每次把較小的節點接到尾端
    static Node merge(Node a, Node b) {
        Node dummy = new Node(0, null), tail = dummy;
        while (a != null && b != null) {
            if (a.val <= b.val) { tail.next = a; a = a.next; }
            else { tail.next = b; b = b.next; }
            tail = tail.next;
        }
        tail.next = a != null ? a : b;
        return dummy.next;
    }

    public static void main(String[] args) {
        Node h = merge(build(1, 4, 7, 10, 15), build(2, 3, 8, 12, 20, 25));
        StringBuilder sb = new StringBuilder();
        for (; h != null; h = h.next) sb.append(h.val).append(h.next != null ? " -> " : "");
        System.out.println(sb);
    }
}
