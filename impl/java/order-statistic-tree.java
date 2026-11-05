public class OrderStatisticTree {
    static class Node { int key, h = 1, size = 1; Node left, right; Node(int k) { key = k; } }
    static int H(Node n) { return n == null ? 0 : n.h; }
    static int S(Node n) { return n == null ? 0 : n.size; }
    static void fix(Node n) { n.h = 1 + Math.max(H(n.left), H(n.right)); n.size = 1 + S(n.left) + S(n.right); }
    static Node rotRight(Node n) { Node l = n.left; n.left = l.right; l.right = n; fix(n); fix(l); return l; }
    static Node rotLeft(Node n) { Node r = n.right; n.right = r.left; r.left = n; fix(n); fix(r); return r; }

    // AVL 平衡；旋轉後重新計算子樹大小
    static Node balance(Node n) {
        fix(n);
        if (H(n.left) - H(n.right) > 1) { if (H(n.left.left) < H(n.left.right)) n.left = rotLeft(n.left); return rotRight(n); }
        if (H(n.right) - H(n.left) > 1) { if (H(n.right.right) < H(n.right.left)) n.right = rotRight(n.right); return rotLeft(n); }
        return n;
    }
    static Node insert(Node n, int k) {
        if (n == null) return new Node(k);
        if (k < n.key) n.left = insert(n.left, k); else n.right = insert(n.right, k);
        return balance(n);
    }
    static Node delete(Node n, int k) {
        if (n == null) return null;
        if (k < n.key) n.left = delete(n.left, k);
        else if (k > n.key) n.right = delete(n.right, k);
        else {
            if (n.left == null || n.right == null) return n.left != null ? n.left : n.right;
            Node m = n.right;
            while (m.left != null) m = m.left;
            n.key = m.key;
            n.right = delete(n.right, m.key);
        }
        return balance(n);
    }
    // 第 k 小（1 起算）：比較 k 與左子樹大小
    static int select(Node n, int k) {
        while (n != null) {
            int ls = S(n.left);
            if (k == ls + 1) return n.key;
            if (k <= ls) n = n.left; else { k -= ls + 1; n = n.right; }
        }
        return -1;
    }
    // 比 x 小的個數 + 1
    static int rank(Node n, int x) {
        int r = 0;
        while (n != null) { if (x <= n.key) n = n.left; else { r += S(n.left) + 1; n = n.right; } }
        return r + 1;
    }
    static String all(Node root) { StringBuilder sb = new StringBuilder(); for (int k = 1; k <= S(root); k++) sb.append(' ').append(select(root, k)); return sb.toString(); }

    public static void main(String[] args) {
        Node root = null;
        for (int k : new int[]{20, 10, 30, 5, 15, 25, 40, 12, 35, 1}) root = insert(root, k);
        System.out.println("select 1..n:" + all(root));
        System.out.println("rank 13 = " + rank(root, 13) + " | rank 26 = " + rank(root, 26) + " | rank 0 = " + rank(root, 0));
        System.out.println("root: " + root.key + " size " + root.size + " height " + root.h);
        root = delete(root, 20);
        root = delete(root, 5);
        System.out.println("after delete 20, 5:" + all(root));
        System.out.println("select 4 = " + select(root, 4) + " | rank 30 = " + rank(root, 30));
    }
}
