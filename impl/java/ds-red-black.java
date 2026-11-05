import java.util.ArrayList;
import java.util.List;

public class RedBlackDemo {
    static class Node {
        int val;
        boolean red;
        Node left, right, parent;
        Node(int v, boolean r) { val = v; red = r; }
    }

    // CLRS 版本：以一個黑色哨兵 NIL 代替所有空指標，插入後以「變色 + 旋轉」修復
    static final Node NIL = new Node(0, false);
    static Node root = NIL;

    static void rotateLeft(Node x) {
        Node y = x.right;
        x.right = y.left;
        if (y.left != NIL) y.left.parent = x;
        y.parent = x.parent;
        if (x.parent == NIL) root = y;
        else if (x == x.parent.left) x.parent.left = y;
        else x.parent.right = y;
        y.left = x; x.parent = y;
    }

    static void rotateRight(Node x) {
        Node y = x.left;
        x.left = y.right;
        if (y.right != NIL) y.right.parent = x;
        y.parent = x.parent;
        if (x.parent == NIL) root = y;
        else if (x == x.parent.right) x.parent.right = y;
        else x.parent.left = y;
        y.right = x; x.parent = y;
    }

    static List<String> insert(int v) {
        Node z = new Node(v, true); // 新節點一律為紅色
        z.left = z.right = NIL;
        Node y = NIL, x = root;
        while (x != NIL) { y = x; x = v < x.val ? x.left : x.right; }
        z.parent = y;
        if (y == NIL) root = z;
        else if (v < y.val) y.left = z;
        else y.right = z;
        return fix(z);
    }

    static List<String> fix(Node z) {
        List<String> log = new ArrayList<>();
        while (z.parent.red) { // 違反「紅節點的子節點必為黑」
            Node g = z.parent.parent;
            boolean left = z.parent == g.left;
            Node u = left ? g.right : g.left;
            if (u.red) { // Case 1：叔叔紅 → 父、叔變黑，祖父變紅，往上繼續
                z.parent.red = u.red = false;
                g.red = true;
                z = g;
                log.add("case 1");
                continue;
            }
            if (z == (left ? z.parent.right : z.parent.left)) { // Case 2：內側 → 轉成外側
                z = z.parent;
                if (left) rotateLeft(z); else rotateRight(z);
                log.add("case 2");
            }
            z.parent.red = false; g.red = true; // Case 3：外側 → 變色後旋轉祖父
            if (left) rotateRight(g); else rotateLeft(g);
            log.add("case 3");
        }
        root.red = false;
        return log;
    }

    // 回傳黑高（含 NIL）；若違反紅黑性質則回傳 -1
    static int blackHeight(Node n) {
        if (n == NIL) return 1;
        if (n.red && (n.left.red || n.right.red)) return -1;
        int l = blackHeight(n.left), r = blackHeight(n.right);
        if (l < 0 || l != r) return -1;
        return l + (n.red ? 0 : 1);
    }

    // 值後面標 R／B 表示紅／黑；括號內為 (左子樹,右子樹)
    static String fmt(Node n) {
        if (n == NIL) return "-";
        String s = n.val + (n.red ? "R" : "B");
        if (n.left == NIL && n.right == NIL) return s;
        return s + "(" + fmt(n.left) + "," + fmt(n.right) + ")";
    }

    public static void main(String[] args) {
        NIL.left = NIL.right = NIL.parent = NIL;
        for (int v : new int[] {41, 38, 31, 12, 19, 8, 45, 50, 55}) {
            List<String> log = insert(v);
            System.out.println("insert " + v + ": " + fmt(root) + (log.isEmpty() ? "" : "   [" + String.join(", ", log) + "]"));
        }
        for (int v : new int[] {19, 40}) {
            List<String> path = new ArrayList<>();
            boolean found = false;
            for (Node c = root; c != NIL; c = v < c.val ? c.left : c.right) {
                path.add(String.valueOf(c.val));
                if (c.val == v) { found = true; break; }
            }
            System.out.println("search " + v + ": " + (found ? "found" : "not found") + ", path " + String.join(" -> ", path));
        }
        System.out.println("black height = " + blackHeight(root) + " (-1 means invalid)");
    }
}
