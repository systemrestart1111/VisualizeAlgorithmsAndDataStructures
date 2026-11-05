import java.util.*;

public class HopcroftMinimization {
    // 龍書範例：(a|b)*abb 的 5 狀態 DFA
    static String STATES = "ABCDE";
    static Map<Character, Map<Character, Character>> DELTA = new HashMap<>();
    static Set<Character> ACCEPT = Set.of('E');

    public static void main(String[] args) {
        String[] rows = {"ABC", "BBD", "CBC", "DBE", "EBC"};
        for (String r : rows) DELTA.put(r.charAt(0), Map.of('a', r.charAt(1), 'b', r.charAt(2)));
        // P 從「接受／非接受」開始；用 W 中的分組 A 與字元 c 切開所有分組
        Set<Character> rest = new TreeSet<>();
        for (char q : STATES.toCharArray()) if (!ACCEPT.contains(q)) rest.add(q);
        List<Set<Character>> P = new ArrayList<>(List.of(new TreeSet<>(ACCEPT), rest));
        List<Set<Character>> W = new ArrayList<>(List.of(ACCEPT.size() <= rest.size() ? new TreeSet<>(ACCEPT) : rest));
        while (!W.isEmpty()) {
            Set<Character> A = W.remove(0);
            for (char c : new char[]{'a', 'b'}) {
                Set<Character> X = new TreeSet<>();
                for (char q : STATES.toCharArray()) if (A.contains(DELTA.get(q).get(c))) X.add(q);
                List<Set<Character>> NP = new ArrayList<>();
                for (Set<Character> Y : P) {
                    Set<Character> inter = new TreeSet<>(), diff = new TreeSet<>();
                    for (char q : Y) (X.contains(q) ? inter : diff).add(q);
                    if (!inter.isEmpty() && !diff.isEmpty()) {
                        NP.add(inter); NP.add(diff);
                        int wi = W.indexOf(Y);
                        if (wi >= 0) { W.remove(wi); W.add(inter); W.add(diff); }
                        else W.add(inter.size() <= diff.size() ? inter : diff);
                    } else NP.add(Y);
                }
                P = NP;
            }
        }
        List<String> groups = new ArrayList<>();
        Map<Character, String> rep = new HashMap<>();
        for (Set<Character> g : P) { StringBuilder sb = new StringBuilder(); for (char q : g) sb.append(q); groups.add(sb.toString()); for (char q : g) rep.put(q, sb.toString()); }
        Collections.sort(groups);
        StringBuilder out = new StringBuilder("minimal states: " + P.size() + " groups:");
        for (String g : groups) out.append(" {").append(g).append("}");
        System.out.println(out);
        List<String> words = new ArrayList<>(List.of(""));
        for (int L = 1; L <= 6; L++) { int sz = words.size(); for (int i = 0; i < sz; i++) if (words.get(i).length() == L - 1) for (char c : new char[]{'a', 'b'}) words.add(words.get(i) + c); }
        int same = 0;
        for (String w : words) {
            char s = 'A';
            String g = rep.get('A');
            for (char ch : w.toCharArray()) { s = DELTA.get(s).get(ch); g = rep.get(DELTA.get(g.charAt(0)).get(ch)); }
            if (ACCEPT.contains(s) == g.equals(rep.get('E'))) same++;
        }
        System.out.println("same language on " + same + "/" + words.size() + " strings up to length 6");
    }
}
