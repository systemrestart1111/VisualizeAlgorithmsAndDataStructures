import java.util.ArrayList;
import java.util.List;

public class BTreeDemo {
    static final int T = 2; // 最小度數：每個節點 T-1 ~ 2T-1 個鍵（T = 2 即 2-3-4 樹）

    static class BNode {
        List<Integer> keys = new ArrayList<>();
        List<BNode> kids = new ArrayList<>();
        boolean leaf;
        BNode(boolean l) { leaf = l; }
    }

    // 所有葉節點在同一深度；往下插入時遇到滿節點就先分裂（預先分裂，不必回頭）
    static BNode root = new BNode(true);

    static void split(BNode x, int i) {
        BNode y = x.kids.get(i), z = new BNode(y.leaf);
        int mid = y.keys.get(T - 1); // 中間鍵上移到父節點
        z.keys.addAll(y.keys.subList(T, y.keys.size()));
        y.keys.subList(T - 1, y.keys.size()).clear();
        if (!y.leaf) {
            z.kids.addAll(y.kids.subList(T, y.kids.size()));
            y.kids.subList(T, y.kids.size()).clear();
        }
        x.keys.add(i, mid);
        x.kids.add(i + 1, z);
    }

    static void insert(int k) {
        if (root.keys.size() == 2 * T - 1) { // 根滿了：樹長高一層
            BNode s = new BNode(false);
            s.kids.add(root);
            root = s;
            split(s, 0);
        }
        BNode x = root;
        while (!x.leaf) {
            int i = 0;
            while (i < x.keys.size() && k > x.keys.get(i)) i++;
            if (x.kids.get(i).keys.size() == 2 * T - 1) {
                split(x, i);
                if (k > x.keys.get(i)) i++;
            }
            x = x.kids.get(i);
        }
        int i = 0;
        while (i < x.keys.size() && x.keys.get(i) < k) i++;
        x.keys.add(i, k);
    }

    static String nodeStr(BNode n) {
        StringBuilder sb = new StringBuilder("[");
        for (int j = 0; j < n.keys.size(); j++) sb.append(j > 0 ? " " : "").append(n.keys.get(j));
        return sb.append("]").toString();
    }

    static List<List<BNode>> levels() {
        List<List<BNode>> out = new ArrayList<>();
        List<BNode> level = new ArrayList<>(List.of(root));
        while (!level.isEmpty()) {
            out.add(level);
            List<BNode> next = new ArrayList<>();
            for (BNode n : level) next.addAll(n.kids);
            level = next;
        }
        return out;
    }

    // 逐層列出節點，層與層之間以 / 分隔
    static String show() {
        List<String> parts = new ArrayList<>();
        for (List<BNode> lvl : levels()) {
            List<String> ns = new ArrayList<>();
            for (BNode n : lvl) ns.add(nodeStr(n));
            parts.add(String.join(" ", ns));
        }
        return String.join(" / ", parts);
    }

    public static void main(String[] args) {
        for (int k : new int[] {10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 28}) {
            insert(k);
            System.out.println(String.format("insert %2d: %s", k, show()));
        }
        for (int k : new int[] {17, 13}) {
            List<String> path = new ArrayList<>();
            boolean found = false;
            for (BNode x = root;;) {
                path.add(nodeStr(x));
                int i = 0;
                while (i < x.keys.size() && k > x.keys.get(i)) i++;
                if (i < x.keys.size() && x.keys.get(i) == k) { found = true; break; }
                if (x.leaf) break;
                x = x.kids.get(i);
            }
            System.out.println("search " + k + ": " + (found ? "found" : "not found") + ", path " + String.join(" -> ", path));
        }
        System.out.println("height = " + levels().size());
    }
}
