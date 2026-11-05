import java.util.ArrayList;
import java.util.List;

public class BPlusTreeDemo {
    static final int M = 4; // 階數：節點的鍵數達到 M 就分裂

    static class BPNode {
        List<Integer> keys = new ArrayList<>();
        List<BPNode> kids = new ArrayList<>();
        boolean leaf;
        BPNode next;
        BPNode(boolean l) { leaf = l; }
    }

    // 資料都在葉節點、內部節點只放索引鍵；葉節點以 next 串成串列，範圍查詢只需沿串列走
    static BPNode root = new BPNode(true);

    static List<BPNode> findPath(int k) {
        List<BPNode> path = new ArrayList<>();
        BPNode x = root;
        path.add(x);
        while (!x.leaf) {
            int i = 0;
            while (i < x.keys.size() && k >= x.keys.get(i)) i++;
            x = x.kids.get(i);
            path.add(x);
        }
        return path;
    }

    static void insert(int k) {
        List<BPNode> path = findPath(k);
        BPNode leaf = path.get(path.size() - 1);
        if (leaf.keys.contains(k)) return;
        int i = 0;
        while (i < leaf.keys.size() && leaf.keys.get(i) < k) i++;
        leaf.keys.add(i, k);
        BPNode node = leaf;
        int d = path.size() - 1;
        while (node.keys.size() >= M) {
            BPNode nw = new BPNode(node.leaf);
            int mid = (node.keys.size() + 1) / 2, up;
            if (node.leaf) { // 葉分裂：右半第一個鍵「複製」到父節點
                nw.keys.addAll(node.keys.subList(mid, node.keys.size()));
                node.keys.subList(mid, node.keys.size()).clear();
                nw.next = node.next;
                node.next = nw;
                up = nw.keys.get(0);
            } else { // 內部分裂：中間鍵「移動」到父節點
                up = node.keys.get(mid - 1);
                nw.keys.addAll(node.keys.subList(mid, node.keys.size()));
                nw.kids.addAll(node.kids.subList(mid, node.kids.size()));
                node.keys.subList(mid - 1, node.keys.size()).clear();
                node.kids.subList(mid, node.kids.size()).clear();
            }
            if (d == 0) { // 分裂到根：樹長高一層
                root = new BPNode(false);
                root.keys.add(up);
                root.kids.add(node);
                root.kids.add(nw);
                break;
            }
            BPNode parent = path.get(d - 1);
            int pi = parent.kids.indexOf(node);
            parent.keys.add(pi, up);
            parent.kids.add(pi + 1, nw);
            node = parent;
            d--;
        }
    }

    static boolean search(int k) {
        List<BPNode> path = findPath(k);
        return path.get(path.size() - 1).keys.contains(k);
    }

    static List<Integer> range(int a, int b) {
        List<Integer> out = new ArrayList<>();
        List<BPNode> path = findPath(a);
        for (BPNode x = path.get(path.size() - 1); x != null; x = x.next) {
            for (int k : x.keys) if (k >= a && k <= b) out.add(k);
            if (!x.keys.isEmpty() && x.keys.get(x.keys.size() - 1) > b) break;
        }
        return out;
    }

    static String nodeStr(BPNode n) {
        StringBuilder sb = new StringBuilder("[");
        for (int j = 0; j < n.keys.size(); j++) sb.append(j > 0 ? " " : "").append(n.keys.get(j));
        return sb.append("]").toString();
    }

    static String show() {
        List<String> parts = new ArrayList<>();
        for (List<BPNode> level = new ArrayList<>(List.of(root)); !level.isEmpty(); ) {
            List<String> ns = new ArrayList<>();
            List<BPNode> next = new ArrayList<>();
            for (BPNode n : level) { ns.add(nodeStr(n)); next.addAll(n.kids); }
            parts.add(String.join(" ", ns));
            level = next;
        }
        return String.join(" / ", parts);
    }

    static String b(boolean x) { return x ? "True" : "False"; }

    public static void main(String[] args) {
        for (int k : new int[] {5, 15, 25, 35, 45, 10, 20, 30, 40, 50, 12, 28}) {
            insert(k);
            System.out.println(String.format("insert %2d: %s", k, show()));
        }
        BPNode x = root;
        while (!x.leaf) x = x.kids.get(0);
        List<String> ls = new ArrayList<>();
        for (; x != null; x = x.next) ls.add(nodeStr(x));
        System.out.println("leaves: " + String.join(" -> ", ls));
        System.out.println("search 28 -> " + b(search(28)) + "  search 33 -> " + b(search(33)));
        StringBuilder sb = new StringBuilder("range [12, 35]:");
        for (int k : range(12, 35)) sb.append(' ').append(k);
        System.out.println(sb);
    }
}
