import java.util.*;

public class Eertree {
    // 兩個虛根（長度 −1、0）；每次從最長回文後綴往上找能在兩側接上 c 的回文
    static List<String> eertree(String s) {
        List<Integer> len = new ArrayList<>(List.of(-1, 0)), link = new ArrayList<>(List.of(0, 0));
        List<Map<Character, Integer>> kids = new ArrayList<>(List.of(new HashMap<>(), new HashMap<>()));
        List<String> pal = new ArrayList<>(List.of("", ""));
        int last = 1;
        for (int i = 0; i < s.length(); i++) {
            final int ii = i;
            char c = s.charAt(i);
            java.util.function.IntPredicate fits = v -> { int j = ii - len.get(v) - 1; return j >= 0 && s.charAt(j) == c; };
            int cur = last;
            while (!fits.test(cur)) cur = link.get(cur);
            if (kids.get(cur).containsKey(c)) { last = kids.get(cur).get(c); continue; }
            int v = len.size();
            len.add(len.get(cur) + 2);
            pal.add(len.get(v) == 1 ? String.valueOf(c) : c + pal.get(cur) + c);
            kids.add(new HashMap<>());
            if (len.get(v) == 1) link.add(1);
            else { int w = link.get(cur); while (!fits.test(w)) w = link.get(w); link.add(kids.get(w).get(c)); }
            kids.get(cur).put(c, v);
            last = v;
        }
        return pal.subList(2, pal.size());
    }

    public static void main(String[] args) {
        for (String s : new String[]{"abacabadab", "eertree", "aaaa", "abc"}) {
            List<String> p = new ArrayList<>(eertree(s));
            Collections.sort(p);
            Set<String> brute = new HashSet<>();
            for (int i = 0; i < s.length(); i++) for (int j = i + 1; j <= s.length(); j++) { String t = s.substring(i, j); if (t.equals(new StringBuilder(t).reverse().toString())) brute.add(t); }
            StringBuilder sb = new StringBuilder();
            for (String x : p) sb.append(sb.length() > 0 ? ", " : "").append("'").append(x).append("'");
            System.out.println(s + ": " + p.size() + " palindromes [" + sb + "] (brute " + brute.size() + ")");
        }
    }
}
