public class SplayDemo {
    static class Node {
        int val;
        Node left, right;
        Node(int v) { val = v; }
    }

    // 每次存取後都把該節點轉到根；不存任何平衡資訊，均攤 O(log n)
    static Node root;

    static Node rotateRight(Node x) { Node y = x.left; x.left = y.right; y.right = x; return y; }
    static Node rotateLeft(Node x) { Node y = x.right; x.right = y.left; y.left = x; return y; }

    // 把 k 轉到根；k 不存在時，轉上來的是搜尋路徑上最後一個節點
    static Node splay(Node r, int k) {
        if (r == null || r.val == k) return r;
        if (k < r.val) {
            if (r.left == null) return r;
            if (k < r.left.val) { // Zig-Zig（左左）：先轉祖父
                r.left.left = splay(r.left.left, k);
                r = rotateRight(r);
            } else if (k > r.left.val) { // Zig-Zag（左右）
                r.left.right = splay(r.left.right, k);
                if (r.left.right != null) r.left = rotateLeft(r.left);
            }
            return r.left != null ? rotateRight(r) : r;
        }
        if (r.right == null) return r;
        if (k > r.right.val) { // Zig-Zig（右右）
            r.right.right = splay(r.right.right, k);
            r = rotateLeft(r);
        } else if (k < r.right.val) { // Zig-Zag（右左）
            r.right.left = splay(r.right.left, k);
            if (r.right.left != null) r.right = rotateRight(r.right);
        }
        return r.right != null ? rotateLeft(r) : r;
    }

    static void insert(int k) {
        if (root == null) { root = new Node(k); return; }
        Node cur = root;
        while (k != cur.val) { // 先做一般 BST 插入
            Node nxt = k < cur.val ? cur.left : cur.right;
            if (nxt == null) {
                nxt = new Node(k);
                if (k < cur.val) cur.left = nxt; else cur.right = nxt;
            }
            cur = nxt;
        }
        root = splay(root, k);
    }

    static boolean search(int k) {
        root = splay(root, k);
        return root != null && root.val == k;
    }

    static boolean delete(int k) {
        if (!search(k)) return false;
        if (root.left == null) root = root.right;
        else {
            Node right = root.right;
            root = splay(root.left, k); // 左子樹最大值轉到根，它沒有右子
            root.right = right;
        }
        return true;
    }

    // 括號表示法：值(左子樹,右子樹)，空子樹寫成 -
    static String fmt(Node n) {
        if (n == null) return "-";
        if (n.left == null && n.right == null) return String.valueOf(n.val);
        return n.val + "(" + fmt(n.left) + "," + fmt(n.right) + ")";
    }

    static String b(boolean x) { return x ? "True" : "False"; }

    public static void main(String[] args) {
        for (int v : new int[] {50, 30, 70, 20, 40, 60, 80}) { insert(v); System.out.println("insert " + v + ": " + fmt(root)); }
        for (int v : new int[] {40, 65}) { boolean f = search(v); System.out.println("search " + v + " -> " + b(f) + ": " + fmt(root)); }
        for (int v : new int[] {30, 99}) { boolean ok = delete(v); System.out.println("delete " + v + " -> " + b(ok) + ": " + fmt(root)); }
    }
}
