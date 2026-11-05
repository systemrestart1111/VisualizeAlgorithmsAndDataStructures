import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

public class TrieDemo {
    static class TrieNode {
        Map<Character, TrieNode> kids = new TreeMap<>(); // TreeMap 依鍵排序，走訪時自然是字母序
        boolean end;
    }

    // 每條從根出發的路徑代表一個前綴；end 標記「到這裡是一個完整單字」
    static TrieNode root = new TrieNode();
    static int nodes = 1;

    static void insert(String w) {
        TrieNode cur = root;
        for (char ch : w.toCharArray()) {
            if (!cur.kids.containsKey(ch)) { cur.kids.put(ch, new TrieNode()); nodes++; }
            cur = cur.kids.get(ch);
        }
        cur.end = true;
    }

    static TrieNode find(String p) {
        TrieNode cur = root;
        for (char ch : p.toCharArray()) {
            cur = cur.kids.get(ch);
            if (cur == null) return null;
        }
        return cur;
    }

    static boolean search(String w) {
        TrieNode n = find(w);
        return n != null && n.end;
    }

    static void dfs(TrieNode n, String s, List<String> out) {
        if (n.end) out.add(s);
        for (Map.Entry<Character, TrieNode> e : n.kids.entrySet()) dfs(e.getValue(), s + e.getKey(), out);
    }

    static List<String> startsWith(String p) {
        List<String> out = new ArrayList<>();
        TrieNode n = find(p);
        if (n != null) dfs(n, p, out);
        return out;
    }

    static boolean delete(String w) {
        if (!search(w)) return false;
        List<TrieNode> path = new ArrayList<>();
        path.add(root);
        for (char ch : w.toCharArray()) path.add(path.get(path.size() - 1).kids.get(ch));
        path.get(w.length()).end = false;
        for (int i = w.length(); i > 0; i--) { // 從尾端往回剪掉不再需要的節點
            TrieNode node = path.get(i);
            if (node.end || !node.kids.isEmpty()) break;
            path.get(i - 1).kids.remove(w.charAt(i - 1));
            nodes--;
        }
        return true;
    }

    static String join(List<String> v) { return v.isEmpty() ? "-" : String.join(" ", v); }
    static String b(boolean x) { return x ? "True" : "False"; }

    public static void main(String[] args) {
        for (String w : new String[] {"tea", "ten", "to", "inn", "in", "tree", "try"}) insert(w);
        System.out.println("words: " + join(startsWith("")) + " (nodes = " + nodes + ")");
        System.out.println("search tea -> " + b(search("tea")) + "  search te -> " + b(search("te")) + " (prefix only)");
        for (String p : new String[] {"te", "tr", "x"}) System.out.println("prefix \"" + p + "\": " + join(startsWith(p)));
        for (String w : new String[] {"in", "tree", "tea"}) {
            boolean ok = delete(w);
            System.out.println("delete " + w + " -> " + b(ok) + ": " + join(startsWith("")) + " (nodes = " + nodes + ")");
        }
    }
}
