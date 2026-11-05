import java.util.*;

public class SuffixAutomaton {
    // 逐字元擴充；len 不連續時複製 clone
    static List<Integer> len, link;
    static List<Map<Character, Integer>> nxt;

    static void build(String s) {
        len = new ArrayList<>(List.of(0)); link = new ArrayList<>(List.of(-1)); nxt = new ArrayList<>(List.of(new HashMap<>()));
        int last = 0;
        for (char c : s.toCharArray()) {
            int cur = len.size(), p = last;
            len.add(len.get(last) + 1); link.add(-1); nxt.add(new HashMap<>());
            while (p != -1 && !nxt.get(p).containsKey(c)) { nxt.get(p).put(c, cur); p = link.get(p); }
            if (p == -1) link.set(cur, 0);
            else {
                int q = nxt.get(p).get(c);
                if (len.get(p) + 1 == len.get(q)) link.set(cur, q);
                else {
                    int clone = len.size();
                    len.add(len.get(p) + 1); link.add(link.get(q)); nxt.add(new HashMap<>(nxt.get(q)));
                    while (p != -1 && Objects.equals(nxt.get(p).get(c), q)) { nxt.get(p).put(c, clone); p = link.get(p); }
                    link.set(q, clone); link.set(cur, clone);
                }
            }
            last = cur;
        }
    }

    public static void main(String[] args) {
        for (String s : new String[]{"abcbcabc", "banana", "aaaa", "abcd"}) {
            build(s);
            int distinct = 0;
            for (int v = 1; v < len.size(); v++) distinct += len.get(v) - len.get(link.get(v));
            Set<String> subs = new HashSet<>();
            for (int i = 0; i < s.length(); i++) for (int j = i + 1; j <= s.length(); j++) subs.add(s.substring(i, j));
            System.out.println(s + ": states " + len.size() + ", distinct substrings " + distinct + " (brute " + subs.size() + ")");
        }
    }
}
