import java.util.*;

public class LfuCache {
    // 依使用次數分桶，每桶是一條 LRU（LinkedHashSet：前面最久未用）；追蹤 minFreq
    static int cap = 2, minFreq = 0;
    static Map<Integer, Integer> val = new HashMap<>(), freq = new TreeMap<>();
    static Map<Integer, LinkedHashSet<Integer>> buckets = new HashMap<>();

    static void touch(int k) {
        int f = freq.get(k);
        buckets.get(f).remove(k);
        if (buckets.get(f).isEmpty() && minFreq == f) minFreq++;
        freq.put(k, f + 1);
        buckets.computeIfAbsent(f + 1, x -> new LinkedHashSet<>()).add(k);
    }
    static int get(int k) {
        if (!val.containsKey(k)) return -1;
        touch(k);
        return val.get(k);
    }
    static void put(int k, int v) {
        if (cap <= 0) return;
        if (val.containsKey(k)) { val.put(k, v); touch(k); return; }
        if (val.size() >= cap) {
            int old = buckets.get(minFreq).iterator().next();
            buckets.get(minFreq).remove(old);
            val.remove(old); freq.remove(old);
        }
        val.put(k, v); freq.put(k, 1);
        buckets.computeIfAbsent(1, x -> new LinkedHashSet<>()).add(k);
        minFreq = 1;
    }

    public static void main(String[] args) {
        put(1, 1); put(2, 2);
        System.out.println("get 1 -> " + get(1));
        put(3, 3);
        int a = get(2), b = get(3);
        System.out.println("get 2 -> " + a + " | get 3 -> " + b);
        put(4, 4);
        a = get(1); b = get(3);
        int d = get(4);
        System.out.println("get 1 -> " + a + " | get 3 -> " + b + " | get 4 -> " + d);
        StringBuilder sb = new StringBuilder("freq:");
        freq.forEach((k, f) -> sb.append(' ').append(k).append(':').append(f));
        System.out.println(sb);
    }
}
