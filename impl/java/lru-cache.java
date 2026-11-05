import java.util.*;

public class LruCache {
    // 雜湊表 + 雙向鏈結串列（LinkedHashMap 的存取順序模式）：最舊的在前面
    static class LRU<K, V> extends LinkedHashMap<K, V> {
        final int cap;
        LRU(int cap) { super(16, 0.75f, true); this.cap = cap; }
        @Override protected boolean removeEldestEntry(Map.Entry<K, V> e) { return size() > cap; }
        int fetch(K k) { V v = get(k); return v == null ? -1 : (Integer) v; }
    }

    public static void main(String[] args) {
        LRU<Integer, Integer> c = new LRU<>(2);
        c.put(1, 1); c.put(2, 2);
        System.out.println("get 1 -> " + c.fetch(1));
        c.put(3, 3);
        System.out.println("get 2 -> " + c.fetch(2));
        c.put(4, 4);
        int a = c.fetch(1), b = c.fetch(3), d = c.fetch(4);
        System.out.println("get 1 -> " + a + " | get 3 -> " + b + " | get 4 -> " + d);
        c.put(3, 33);
        List<String> order = new ArrayList<>();
        c.forEach((k, v) -> order.add(k + ":" + v));
        Collections.reverse(order); // 轉成最近使用在前
        System.out.println("order: " + String.join(" ", order));
        LRU<Integer, Integer> z = new LRU<>(0);
        z.put(1, 1);
        System.out.println("cap 0 get 1 -> " + z.fetch(1));
    }
}
