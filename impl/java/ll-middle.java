public class MiddleOfList {
    static class Node {
        int val;
        Node next;
        Node(int v, Node n) { val = v; next = n; }
    }

    // 快慢指標：fast 一次走兩步、slow 一次走一步，fast 到尾時 slow 在中點
    static Node middle(Node head) {
        Node slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        return slow;
    }

    public static void main(String[] args) {
        int[] vals = {3, 7, 1, 9, 4, 8, 2};
        Node head = null;
        for (int i = vals.length - 1; i >= 0; i--) head = new Node(vals[i], head);
        System.out.println("middle = " + middle(head).val);
    }
}
