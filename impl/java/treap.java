public class Treap {
    static class Node { int key, pri; Node left, right; Node(int k, int p) { key = k; pri = p; } }
    static long seed = 2024;
    // 與網頁相同的 Park–Miller 亂數，固定種子讓結果可重現
    static int rnd(int n) { seed = seed * 48271 % 2147483647; return (int) (seed % n); }

    static Node rotRight(Node n) { Node l = n.left; n.left = l.right; l.right = n; return l; }
    static Node rotLeft(Node n) { Node r = n.right; n.right = r.left; r.left = n; return r; }

    // 依 BST 插到葉子，回溯時若子節點優先權較高就旋轉上來（最大堆積）
    static Node insert(Node n, int key) {
        if (n == null) return new Node(key, rnd(100));
        if (key == n.key) return n;
        if (key < n.key) { n.left = insert(n.left, key); if (n.left.pri > n.pri) n = rotRight(n); }
        else { n.right = insert(n.right, key); if (n.right.pri > n.pri) n = rotLeft(n); }
        return n;
    }
    // 把節點往優先權較高的子節點方向轉下去，直到最多一個子節點再移除
    static Node delete(Node n, int key) {
        if (n == null) return null;
        if (key < n.key) n.left = delete(n.left, key);
        else if (key > n.key) n.right = delete(n.right, key);
        else {
            if (n.left == null || n.right == null) return n.left != null ? n.left : n.right;
            if (n.left.pri > n.right.pri) { n = rotRight(n); n.right = delete(n.right, key); }
            else { n = rotLeft(n); n.left = delete(n.left, key); }
        }
        return n;
    }
    static void pre(Node n, StringBuilder sb) { if (n == null) return; sb.append(' ').append(n.key).append("(p").append(n.pri).append(')'); pre(n.left, sb); pre(n.right, sb); }
    static void in(Node n, StringBuilder sb) { if (n == null) return; in(n.left, sb); sb.append(' ').append(n.key); in(n.right, sb); }

    public static void main(String[] args) {
        Node root = null;
        for (int k : new int[]{30, 15, 45, 8, 22, 37, 52}) root = insert(root, k);
        StringBuilder a = new StringBuilder("preorder:"), b = new StringBuilder("inorder :");
        pre(root, a); in(root, b);
        System.out.println(a); System.out.println(b);
        root = delete(root, 30);
        root = delete(root, 8);
        a = new StringBuilder("after delete 30, 8:"); b = new StringBuilder("inorder :");
        pre(root, a); in(root, b);
        System.out.println(a); System.out.println(b);
    }
}
