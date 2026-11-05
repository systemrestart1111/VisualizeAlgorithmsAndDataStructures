import java.util.ArrayList;
import java.util.List;

public class AVLDemo {
    static class Node {
        int val, h = 1;
        Node left, right;
        Node(int v) { val = v; }
    }

    static List<String> log = new ArrayList<>(); // 本次操作發生的旋轉

    static int height(Node n) { return n == null ? 0 : n.h; }
    static void update(Node n) { n.h = 1 + Math.max(height(n.left), height(n.right)); }
    // 平衡因子 = 左子樹高 − 右子樹高，AVL 要求它在 −1..1 之間
    static int balance(Node n) { return height(n.left) - height(n.right); }

    static Node rotateRight(Node y) {
        Node x = y.left;
        y.left = x.right; x.right = y;
        update(y); update(x);
        return x;
    }

    static Node rotateLeft(Node x) {
        Node y = x.right;
        x.right = y.left; y.left = x;
        update(x); update(y);
        return y;
    }

    static Node rebalance(Node n) {
        update(n);
        int b = balance(n);
        if (b > 1) {
            if (balance(n.left) < 0) { log.add("LR at " + n.val); n.left = rotateLeft(n.left); }
            else log.add("LL at " + n.val);
            return rotateRight(n);
        }
        if (b < -1) {
            if (balance(n.right) > 0) { log.add("RL at " + n.val); n.right = rotateRight(n.right); }
            else log.add("RR at " + n.val);
            return rotateLeft(n);
        }
        return n;
    }

    static Node insert(Node n, int v) {
        if (n == null) return new Node(v);
        if (v < n.val) n.left = insert(n.left, v);
        else if (v > n.val) n.right = insert(n.right, v);
        else return n;
        return rebalance(n); // 遞迴返回時就是「沿路往上」檢查
    }

    static Node delete(Node n, int v) {
        if (n == null) return null;
        if (v < n.val) n.left = delete(n.left, v);
        else if (v > n.val) n.right = delete(n.right, v);
        else {
            if (n.left == null || n.right == null) return n.left != null ? n.left : n.right;
            Node s = n.right;
            while (s.left != null) s = s.left;
            n.val = s.val;
            n.right = delete(n.right, s.val);
        }
        return rebalance(n);
    }

    // 括號表示法：值(左子樹,右子樹)，空子樹寫成 -
    static String fmt(Node n) {
        if (n == null) return "-";
        if (n.left == null && n.right == null) return String.valueOf(n.val);
        return n.val + "(" + fmt(n.left) + "," + fmt(n.right) + ")";
    }

    static void report(String op, int v, Node root) {
        System.out.println(String.format("%s %2d: %s", op, v, fmt(root)) + (log.isEmpty() ? "" : "   [" + String.join(", ", log) + "]"));
    }

    public static void main(String[] args) {
        Node root = null;
        for (int v : new int[] {40, 20, 60, 10, 30, 50, 70, 25, 27, 5, 4}) { log.clear(); root = insert(root, v); report("insert", v, root); }
        for (int v : new int[] {50, 70, 60}) { log.clear(); root = delete(root, v); report("delete", v, root); }
        System.out.println("height = " + height(root));
    }
}
