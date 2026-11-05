import java.util.*;

public class FmIndex {
    static Integer[] sa;
    static TreeMap<Character, Integer> C = new TreeMap<>();
    static Map<Character, int[]> occ = new HashMap<>();
    static int n;

    // 後綴陣列、BWT、C 表與 Occ 前綴計數
    static void build(String text) {
        String t = text + "$";
        n = t.length();
        sa = new Integer[n];
        for (int i = 0; i < n; i++) sa[i] = i;
        Arrays.sort(sa, Comparator.comparing(t::substring));
        TreeMap<Character, Integer> cnt = new TreeMap<>();
        for (char c : t.toCharArray()) cnt.merge(c, 1, Integer::sum);
        int acc = 0;
        for (Map.Entry<Character, Integer> e : cnt.entrySet()) { C.put(e.getKey(), acc); acc += e.getValue(); occ.put(e.getKey(), new int[n + 1]); }
        for (int i = 0; i < n; i++) {
            char L = t.charAt((sa[i] + n - 1) % n);
            for (Map.Entry<Character, int[]> e : occ.entrySet()) e.getValue()[i + 1] = e.getValue()[i] + (e.getKey() == L ? 1 : 0);
        }
    }
    // 向後搜尋：每讀一個字元，sp = C[c] + Occ(c, sp)、ep = C[c] + Occ(c, ep)
    static List<Integer> search(String pat) {
        int sp = 0, ep = n;
        for (int k = pat.length() - 1; k >= 0; k--) {
            char c = pat.charAt(k);
            if (!C.containsKey(c)) return List.of();
            sp = C.get(c) + occ.get(c)[sp];
            ep = C.get(c) + occ.get(c)[ep];
            if (sp >= ep) return List.of();
        }
        List<Integer> pos = new ArrayList<>(Arrays.asList(sa).subList(sp, ep));
        Collections.sort(pos);
        return pos;
    }

    public static void main(String[] args) {
        String text = "abracadabra";
        build(text);
        for (String p : new String[]{"a", "abra", "cad", "ra", "xyz", "abracadabra"}) {
            List<Integer> pos = search(p), brute = new ArrayList<>();
            for (int i = 0; i + p.length() <= text.length(); i++) if (text.startsWith(p, i)) brute.add(i);
            System.out.println("'" + p + "': " + pos.size() + " at " + pos + " (brute " + brute + ")");
        }
    }
}
