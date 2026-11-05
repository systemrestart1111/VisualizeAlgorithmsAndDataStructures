import java.util.ArrayDeque;
import java.util.Queue;

public class TreeTraversal {
    static class Node {
        int val;
        Node left, right;
        Node(int v) { val = v; }
    }

    // 依層序建樹，null 表示空節點
    static Node buildLevel(Integer... tok) {
        Node root = new Node(tok[0]);
        Queue<Node> q = new ArrayDeque<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < tok.length) {
            Node n = q.poll();
            for (int side = 0; side < 2 && i < tok.length; side++, i++) {
                if (tok[i] == null) continue;
                Node c = new Node(tok[i]);
                if (side == 0) n.left = c; else n.right = c;
                q.add(c);
            }
        }
        return root;
    }

    static void pre(Node n, StringBuilder sb) { if (n == null) return; sb.append(' ').append(n.val); pre(n.left, sb); pre(n.right, sb); }   // 根 → 左 → 右
    static void in(Node n, StringBuilder sb) { if (n == null) return; in(n.left, sb); sb.append(' ').append(n.val); in(n.right, sb); }      // 左 → 根 → 右
    static void post(Node n, StringBuilder sb) { if (n == null) return; post(n.left, sb); post(n.right, sb); sb.append(' ').append(n.val); } // 左 → 右 → 根

    public static void main(String[] args) {
        Node root = buildLevel(1, 2, 3, 4, 5, 6, 7, null, 8, 9, null, null, 10);
        StringBuilder a = new StringBuilder("pre:"), b = new StringBuilder("in:"), c = new StringBuilder("post:");
        pre(root, a); in(root, b); post(root, c);
        System.out.println(a + "\n" + b + "\n" + c);
    }
}
