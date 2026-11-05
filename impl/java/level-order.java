import java.util.ArrayDeque;
import java.util.Queue;

public class LevelOrder {
    static class Node {
        int val;
        Node left, right;
        Node(int v) { val = v; }
    }

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

    // BFS：用佇列一層一層處理，每層開始時佇列長度就是這一層的節點數
    public static void main(String[] args) {
        Queue<Node> q = new ArrayDeque<>();
        q.add(buildLevel(1, 2, 3, 4, 5, 6, 7, null, 8, 9, null, null, 10));
        for (int d = 0; !q.isEmpty(); d++) {
            StringBuilder sb = new StringBuilder("level " + d + ":");
            for (int size = q.size(); size > 0; size--) {
                Node n = q.poll();
                sb.append(' ').append(n.val);
                if (n.left != null) q.add(n.left);
                if (n.right != null) q.add(n.right);
            }
            System.out.println(sb);
        }
    }
}
