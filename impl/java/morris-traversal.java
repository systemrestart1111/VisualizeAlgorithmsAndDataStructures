import java.util.ArrayDeque;
import java.util.Queue;
import java.util.StringJoiner;

public class MorrisTraversal {
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

    // 不用堆疊的中序走訪：暫時把左子樹最右節點的 right 指回自己（線索），走完再拆掉，O(1) 額外空間
    static String morrisInorder(Node cur) {
        StringJoiner out = new StringJoiner(" ");
        while (cur != null) {
            if (cur.left == null) {
                out.add(String.valueOf(cur.val));
                cur = cur.right;
            } else {
                Node pre = cur.left;
                while (pre.right != null && pre.right != cur) pre = pre.right;
                if (pre.right == null) { pre.right = cur; cur = cur.left; } // 第一次到達：建立線索後往左
                else {                                                     // 第二次到達：拆除線索
                    pre.right = null;
                    out.add(String.valueOf(cur.val));
                    cur = cur.right;
                }
            }
        }
        return out.toString();
    }

    public static void main(String[] args) {
        System.out.println(morrisInorder(buildLevel(6, 3, 9, 1, 4, 8, 11, null, 2, null, 5, 7)));
    }
}
