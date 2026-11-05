import java.util.*;

public class SubsetConstruction {
    static List<int[]> trans; // {from, to, c}，c = 0 表示 ε

    // 與 thompson-nfa 相同：先轉後序式，再以堆疊組合片段；回傳 {起點, 接受}
    static int[] thompson(String re) {
        StringBuilder tok = new StringBuilder(), out = new StringBuilder();
        for (int i = 0; i < re.length(); i++) { char c = re.charAt(i); tok.append(c); if (i + 1 < re.length() && "|)*+?".indexOf(re.charAt(i + 1)) < 0 && c != '(' && c != '|') tok.append('.'); }
        Deque<Character> ops = new ArrayDeque<>();
        for (char t : tok.toString().toCharArray()) {
            if (Character.isLetterOrDigit(t)) out.append(t);
            else if (t == '(') ops.push(t);
            else if (t == ')') { while (ops.peek() != '(') out.append(ops.pop()); ops.pop(); }
            else { while (!ops.isEmpty() && ops.peek() != '(' && prec(ops.peek()) >= prec(t)) out.append(ops.pop()); ops.push(t); }
        }
        while (!ops.isEmpty()) out.append(ops.pop());
        trans = new ArrayList<>();
        Deque<int[]> st = new ArrayDeque<>();
        int n = 0;
        for (char t : out.toString().toCharArray()) {
            if (Character.isLetterOrDigit(t)) { trans.add(new int[]{n, n + 1, t}); st.push(new int[]{n, n + 1}); n += 2; }
            else if (t == '.') { int[] b = st.pop(), a = st.pop(); trans.add(new int[]{a[1], b[0], 0}); st.push(new int[]{a[0], b[1]}); }
            else if (t == '|') { int[] b = st.pop(), a = st.pop(); trans.add(new int[]{n, a[0], 0}); trans.add(new int[]{n, b[0], 0}); trans.add(new int[]{a[1], n + 1, 0}); trans.add(new int[]{b[1], n + 1, 0}); st.push(new int[]{n, n + 1}); n += 2; }
            else { int[] a = st.pop(); trans.add(new int[]{n, a[0], 0}); trans.add(new int[]{a[1], n + 1, 0}); if (t != '+') trans.add(new int[]{n, n + 1, 0}); if (t != '?') trans.add(new int[]{a[1], a[0], 0}); st.push(new int[]{n, n + 1}); n += 2; }
        }
        return st.pop();
    }
    static int prec(char c) { return c == '|' ? 1 : c == '.' ? 2 : 3; }
    static Set<Integer> closure(Set<Integer> s) {
        Set<Integer> out = new TreeSet<>(s);
        Deque<Integer> stack = new ArrayDeque<>(s);
        while (!stack.isEmpty()) { int u = stack.pop(); for (int[] t : trans) if (t[0] == u && t[2] == 0 && out.add(t[1])) stack.push(t[1]); }
        return out;
    }
    static Set<Integer> move(Set<Integer> s, char c) { Set<Integer> r = new TreeSet<>(); for (int[] t : trans) if (t[2] == c && s.contains(t[0])) r.add(t[1]); return r; }

    public static void main(String[] args) {
        for (String re : new String[]{"(a|b)*abb", "a(b|c)*", "(ab)+c?"}) {
            int[] sa = thompson(re);
            TreeSet<Character> al = new TreeSet<>();
            for (int[] t : trans) if (t[2] != 0) al.add((char) t[2]);
            // DFA 狀態 = NFA 狀態集合；BFS 取 move 後的 ε-closure
            List<Set<Integer>> states = new ArrayList<>(List.of(closure(Set.of(sa[0]))));
            List<Map<Character, Integer>> table = new ArrayList<>(List.of(new HashMap<>()));
            for (int i = 0; i < states.size(); i++)
                for (char c : al) {
                    Set<Integer> mv = move(states.get(i), c);
                    if (mv.isEmpty()) continue;
                    Set<Integer> t = closure(mv);
                    int j = states.indexOf(t);
                    if (j < 0) { j = states.size(); states.add(t); table.add(new HashMap<>()); }
                    table.get(i).put(c, j);
                }
            int nacc = 0;
            for (Set<Integer> s : states) if (s.contains(sa[1])) nacc++;
            // 以所有長度 ≤ 5 的字串比對 NFA 與 DFA
            List<String> words = new ArrayList<>(List.of(""));
            for (int L = 1; L <= 5; L++) { int sz = words.size(); for (int i = 0; i < sz; i++) if (words.get(i).length() == L - 1) for (char c : al) words.add(words.get(i) + c); }
            int agree = 0;
            for (String w : words) {
                Set<Integer> cur = closure(Set.of(sa[0]));
                int s = 0;
                boolean dead = false;
                for (char ch : w.toCharArray()) { cur = closure(move(cur, ch)); if (!dead) { Integer nx = table.get(s).get(ch); if (nx == null) dead = true; else s = nx; } }
                if (cur.contains(sa[1]) == (!dead && states.get(s).contains(sa[1]))) agree++;
            }
            System.out.println(re + ": DFA states " + states.size() + ", accepting " + nacc + ", agree on " + agree + "/" + words.size() + " strings");
        }
    }
}
