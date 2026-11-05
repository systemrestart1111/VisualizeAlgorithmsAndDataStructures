import java.util.ArrayDeque;
import java.util.Queue;

public class TreeDP {
    static class Node {
        int w;
        Node left, right;
        Node(int x) { w = x; }
    }

    static Node build(Integer... tok) {
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

    // 回傳 {選 n 的最大權重, 不選 n 的最大權重}；選了 n 就不能選它的孩子
    static int[] solve(Node n) {
        if (n == null) return new int[] {0, 0};
        int[] l = solve(n.left), r = solve(n.right);
        return new int[] {n.w + l[1] + r[1], Math.max(l[0], l[1]) + Math.max(r[0], r[1])};
    }

    public static void main(String[] args) {
        int[] res = solve(build(3, 4, 5, 1, 3, null, 1, 2, null, 6, null, 4)); // 層序表示的二元樹，數字為權重
        System.out.println("take root: " + res[0] + " skip root: " + res[1]);
        System.out.println("max independent set weight = " + Math.max(res[0], res[1]));
    }
}
