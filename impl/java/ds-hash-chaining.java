import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class HashChaining {
    // 每個桶是一條串列，碰撞的鍵就接在同一條上；負載因子（鍵數 / 桶數）超過 1 時桶數擴為 2m+1 並重新雜湊
    static List<LinkedList<Integer>> buckets = newBuckets(5);
    static int count = 0;

    static List<LinkedList<Integer>> newBuckets(int m) {
        List<LinkedList<Integer>> b = new ArrayList<>();
        for (int i = 0; i < m; i++) b.add(new LinkedList<>());
        return b;
    }

    static void rehash() {
        List<Integer> old = new ArrayList<>();
        for (LinkedList<Integer> b : buckets) old.addAll(b);
        buckets = newBuckets(2 * buckets.size() + 1);
        count = 0;
        System.out.println("  -> rehash to m = " + buckets.size());
        for (int k : old) insert(k);
    }

    static void insert(int k) {
        LinkedList<Integer> b = buckets.get(k % buckets.size());
        if (b.contains(k)) return;
        b.add(k);
        if (++count > buckets.size()) rehash();
    }

    static boolean search(int k) { return buckets.get(k % buckets.size()).contains(k); }

    static boolean delete(int k) {
        boolean ok = buckets.get(k % buckets.size()).remove(Integer.valueOf(k));
        if (ok) count--;
        return ok;
    }

    static void show() {
        for (int i = 0; i < buckets.size(); i++) {
            StringBuilder sb = new StringBuilder(String.format("  [%2d] ", i));
            if (buckets.get(i).isEmpty()) sb.append('-');
            for (int j = 0; j < buckets.get(i).size(); j++) sb.append(j > 0 ? " -> " : "").append(buckets.get(i).get(j));
            System.out.println(sb);
        }
    }

    public static void main(String[] args) {
        for (int k : new int[] {15, 11, 27, 8, 12, 20}) { System.out.println("insert " + k); insert(k); }
        show();
        System.out.println("search 27 -> " + (search(27) ? "True" : "False") + "  search 9 -> " + (search(9) ? "True" : "False"));
        System.out.println("delete 12 -> " + (delete(12) ? "True" : "False"));
        show();
    }
}
