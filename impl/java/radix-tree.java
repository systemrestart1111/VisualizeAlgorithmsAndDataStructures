import java.util.*;

public class RadixTree {
    static class Node { boolean end; TreeMap<Character, Object[]> kids = new TreeMap<>(); } // 首字元 → {邊標籤, 子節點}

    // 共享一部分的邊要在分岔處分裂
    static void insert(Node root, String w) {
        Node n = root;
        int i = 0;
        while (i < w.length()) {
            Object[] e = n.kids.get(w.charAt(i));
            if (e == null) { Node leaf = new Node(); leaf.end = true; n.kids.put(w.charAt(i), new Object[]{w.substring(i), leaf}); return; }
            String label = (String) e[0];
            Node child = (Node) e[1];
            int k = 0;
            while (k < label.length() && i + k < w.length() && label.charAt(k) == w.charAt(i + k)) k++;
            if (k == label.length()) { n = child; i += k; continue; }
            Node mid = new Node();
            mid.kids.put(label.charAt(k), new Object[]{label.substring(k), child});
            n.kids.put(w.charAt(i), new Object[]{label.substring(0, k), mid});
            n = mid; i += k;
        }
        n.end = true;
    }
    // 回傳 {停下的節點, 是否停在邊的中間}；找不到時節點為 null
    static Object[] walk(Node root, String w) {
        Node n = root;
        int i = 0;
        while (i < w.length()) {
            Object[] e = n.kids.get(w.charAt(i));
            if (e == null) return new Object[]{null, false};
            String label = (String) e[0];
            String part = w.substring(i, Math.min(w.length(), i + label.length()));
            if (!label.startsWith(part)) return new Object[]{null, false};
            if (part.length() < label.length()) return new Object[]{e[1], true};
            n = (Node) e[1]; i += label.length();
        }
        return new Object[]{n, false};
    }
    static int count(Node n) { int s = n.end ? 1 : 0; for (Object[] e : n.kids.values()) s += count((Node) e[1]); return s; }
    static void dump(Node n, int depth) {
        for (Object[] e : n.kids.values()) {
            System.out.println("  ".repeat(depth) + e[0] + (((Node) e[1]).end ? "*" : ""));
            dump((Node) e[1], depth + 1);
        }
    }

    public static void main(String[] args) {
        Node root = new Node();
        for (String w : new String[]{"romane", "romanus", "romulus", "rubens", "ruber", "rubicon", "rubicundus", "rom"}) insert(root, w);
        dump(root, 0);
        for (String w : new String[]{"rom", "romane", "rub", "roman"}) {
            Object[] r = walk(root, w);
            Node n = (Node) r[0];
            System.out.println("search " + w + ": " + (n != null && !(Boolean) r[1] && n.end ? "True" : "False"));
        }
        for (String p : new String[]{"r", "rom", "rub", "rubi", "ru", "x"}) {
            Node n = (Node) walk(root, p)[0];
            System.out.println("prefix " + p + ": " + (n != null ? count(n) : 0));
        }
    }
}
