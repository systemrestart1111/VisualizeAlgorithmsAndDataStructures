import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class TreeSort {
    static class Node {
        int key;
        Node left, right;
        Node(int k) { key = k; }
    }

    // 插入二元搜尋樹：小於往左、其餘往右
    static Node insert(Node root, int key) {
        if (root == null) return new Node(key);
        if (key < root.key) root.left = insert(root.left, key);
        else root.right = insert(root.right, key);
        return root;
    }

    // 中序走訪 BST 會得到遞增序列
    static void inorder(Node root, List<Integer> out) {
        if (root == null) return;
        inorder(root.left, out);
        out.add(root.key);
        inorder(root.right, out);
    }

    public static void main(String[] args) {
        int[] a = {50, 30, 70, 20, 40, 60, 80, 35, 65, 10, 45};
        Node root = null;
        for (int x : a) root = insert(root, x);
        List<Integer> out = new ArrayList<>();
        inorder(root, out);
        System.out.println(out.stream().map(String::valueOf).collect(Collectors.joining(" ")));
    }
}
