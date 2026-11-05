import java.util.ArrayList;
import java.util.List;

public class BSTDemo {
    static class Node {
        int val;
        Node left, right;
        Node(int v) { val = v; }
    }

    // 左子樹 < 節點 < 右子樹；搜尋、插入、刪除都只沿一條路徑往下
    static Node root;

    static void insert(int v) {
        if (root == null) { root = new Node(v); return; }
        Node cur = root;
        while (v != cur.val) {
            if (v < cur.val) {
                if (cur.left == null) cur.left = new Node(v);
                cur = cur.left;
            } else {
                if (cur.right == null) cur.right = new Node(v);
                cur = cur.right;
            }
        }
    }

    static boolean search(int v, List<Integer> path) {
        for (Node c = root; c != null; c = v < c.val ? c.left : c.right) {
            path.add(c.val);
            if (v == c.val) return true;
        }
        return false;
    }

    static Node delete(Node n, int v) {
        if (n == null) return null;
        if (v < n.val) n.left = delete(n.left, v);
        else if (v > n.val) n.right = delete(n.right, v);
        else {
            if (n.left == null) return n.right; // 葉節點或只有右子
            if (n.right == null) return n.left;
            Node s = n.right; // 兩個子節點：以中序後繼（右子樹最小值）取代
            while (s.left != null) s = s.left;
            n.val = s.val;
            n.right = delete(n.right, s.val);
        }
        return n;
    }

    static String inorder(Node n) { return n == null ? "" : inorder(n.left) + " " + n.val + inorder(n.right); }

    // 括號表示法：值(左子樹,右子樹)，空子樹寫成 -
    static String fmt(Node n) {
        if (n == null) return "-";
        if (n.left == null && n.right == null) return String.valueOf(n.val);
        return n.val + "(" + fmt(n.left) + "," + fmt(n.right) + ")";
    }

    public static void main(String[] args) {
        for (int v : new int[] {50, 30, 70, 20, 40, 60, 80, 35, 65}) insert(v);
        System.out.println("build: " + fmt(root));
        System.out.println("inorder:" + inorder(root));
        for (int v : new int[] {65, 45}) {
            List<Integer> path = new ArrayList<>();
            boolean found = search(v, path);
            StringBuilder sb = new StringBuilder("search " + v + ": " + (found ? "found" : "not found") + ", path ");
            for (int j = 0; j < path.size(); j++) sb.append(j > 0 ? " -> " : "").append(path.get(j));
            System.out.println(sb);
        }
        Node lo = root, hi = root;
        while (lo.left != null) lo = lo.left;
        while (hi.right != null) hi = hi.right;
        System.out.println("min = " + lo.val + ", max = " + hi.val);
        int[] dels = {20, 30, 50};
        String[] kinds = {"leaf", "one child", "two children"};
        for (int i = 0; i < 3; i++) {
            root = delete(root, dels[i]);
            System.out.println("delete " + dels[i] + " (" + kinds[i] + "): " + fmt(root));
        }
        System.out.println("inorder:" + inorder(root));
    }
}
