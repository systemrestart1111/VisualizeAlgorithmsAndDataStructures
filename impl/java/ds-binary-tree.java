import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;

public class BinaryTreeDemo {
    static class Node {
        int val;
        Node left, right, parent;
        Node(int v, Node p) { val = v; parent = p; }
    }

    // 依層序插入，形狀維持完全二元樹；刪除時以最深最右的節點補位
    static Node root;

    static List<Node> levelOrder() {
        List<Node> out = new ArrayList<>();
        ArrayDeque<Node> q = new ArrayDeque<>();
        if (root != null) q.add(root);
        while (!q.isEmpty()) {
            Node n = q.poll();
            out.add(n);
            if (n.left != null) q.add(n.left);
            if (n.right != null) q.add(n.right);
        }
        return out;
    }

    static void insert(int v) {
        if (root == null) { root = new Node(v, null); return; }
        for (Node n : levelOrder()) { // 第一個缺少子節點的位置
            if (n.left == null) { n.left = new Node(v, n); return; }
            if (n.right == null) { n.right = new Node(v, n); return; }
        }
    }

    static boolean delete(int v) {
        List<Node> nodes = levelOrder();
        Node target = null;
        for (Node n : nodes) if (n.val == v) { target = n; break; }
        if (target == null) return false;
        Node deepest = nodes.get(nodes.size() - 1), p = deepest.parent;
        target.val = deepest.val;
        if (p == null) root = null;
        else if (p.right == deepest) p.right = null;
        else p.left = null;
        return true;
    }

    static void preorder(Node n, List<Integer> out) { if (n != null) { out.add(n.val); preorder(n.left, out); preorder(n.right, out); } }
    static void inorder(Node n, List<Integer> out) { if (n != null) { inorder(n.left, out); out.add(n.val); inorder(n.right, out); } }
    static void postorder(Node n, List<Integer> out) { if (n != null) { postorder(n.left, out); postorder(n.right, out); out.add(n.val); } }

    // 括號表示法：值(左子樹,右子樹)，空子樹寫成 -
    static String fmt(Node n) {
        if (n == null) return "-";
        if (n.left == null && n.right == null) return String.valueOf(n.val);
        return n.val + "(" + fmt(n.left) + "," + fmt(n.right) + ")";
    }

    static void show(String name, List<Integer> vals) {
        StringBuilder sb = new StringBuilder(String.format("%-10s", name));
        for (int v : vals) sb.append(' ').append(v);
        System.out.println(sb);
    }

    static List<Integer> levelVals() {
        List<Integer> out = new ArrayList<>();
        for (Node n : levelOrder()) out.add(n.val);
        return out;
    }

    public static void main(String[] args) {
        for (int v = 1; v <= 8; v++) insert(v);
        System.out.println("insert 1..8: " + fmt(root));
        List<Integer> a = new ArrayList<>(), b = new ArrayList<>(), c = new ArrayList<>();
        preorder(root, a); inorder(root, b); postorder(root, c);
        show("preorder:", a); show("inorder:", b); show("postorder:", c);
        show("level:", levelVals());
        delete(2);
        System.out.println("delete 2: " + fmt(root));
        show("level:", levelVals());
    }
}
