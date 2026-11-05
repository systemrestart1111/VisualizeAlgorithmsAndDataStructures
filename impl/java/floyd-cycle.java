public class FloydCycle {
    static class Node {
        int val;
        Node next;
        Node(int v) { val = v; }
    }

    static Node buildWithCycle(int[] vals, int pos) {
        Node[] nodes = new Node[vals.length];
        for (int i = 0; i < vals.length; i++) nodes[i] = new Node(vals[i]);
        for (int i = 0; i + 1 < vals.length; i++) nodes[i].next = nodes[i + 1];
        if (pos >= 0) nodes[vals.length - 1].next = nodes[pos]; // 尾端接回第 pos 個節點形成環
        return nodes[0];
    }

    // 龜兔賽跑：兔子一次兩步、烏龜一次一步；有環時兩者必定相遇
    static String hasCycle(Node head) {
        Node slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return "(True, " + slow.val + ")";
        }
        return "(False, None)";
    }

    public static void main(String[] args) {
        int[] vals = {3, 8, 1, 6, 9, 4, 7, 2, 5};
        System.out.println("pos 3: " + hasCycle(buildWithCycle(vals, 3)));
        System.out.println("pos -1: " + hasCycle(buildWithCycle(vals, -1)));
    }
}
