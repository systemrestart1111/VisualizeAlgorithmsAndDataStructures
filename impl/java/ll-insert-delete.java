public class LinkedListInsertDelete {
    static class Node {
        int val;
        Node next;
        Node(int v, Node n) { val = v; next = n; }
    }

    static String str(Node h) {
        StringBuilder sb = new StringBuilder();
        for (; h != null; h = h.next) sb.append(h.val).append(h.next != null ? " -> " : "");
        return sb.toString();
    }

    // 在位置 i 插入：找到第 i-1 個節點，新節點先接上後繼，再讓前驅指向新節點
    static Node insertAt(Node head, int i, int v) {
        if (i == 0) return new Node(v, head);
        Node prev = head;
        for (int k = 0; k < i - 1; k++) prev = prev.next;
        prev.next = new Node(v, prev.next);
        return head;
    }

    // 刪除位置 i：讓前驅直接跳過該節點
    static Node deleteAt(Node head, int i) {
        if (i == 0) return head.next;
        Node prev = head;
        for (int k = 0; k < i - 1; k++) prev = prev.next;
        prev.next = prev.next.next;
        return head;
    }

    public static void main(String[] args) {
        int[] vals = {10, 20, 30, 40, 50};
        Node head = null;
        for (int i = vals.length - 1; i >= 0; i--) head = new Node(vals[i], head);
        head = insertAt(head, 2, 99);
        System.out.println("insert 99 at 2: " + str(head));
        head = deleteAt(head, 4);
        System.out.println("delete at 4:   " + str(head));
    }
}
