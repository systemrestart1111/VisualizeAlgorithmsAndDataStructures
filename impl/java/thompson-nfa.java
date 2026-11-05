import java.util.*;

public class ThompsonNfa {
    static List<int[]> trans; // {from, to, c}，c = 0 表示 ε
    static int n;

    // 插入隱含的連接符號「.」後，用 Shunting-yard 轉成後序式
    static String toPostfix(String re) {
        StringBuilder tok = new StringBuilder(), out = new StringBuilder();
        Deque<Character> ops = new ArrayDeque<>();
        for (int i = 0; i < re.length(); i++) {
            char c = re.charAt(i);
            tok.append(c);
            if (i + 1 < re.length() && "|)*+?".indexOf(re.charAt(i + 1)) < 0 && c != '(' && c != '|') tok.append('.');
        }
        for (char t : tok.toString().toCharArray()) {
            if (Character.isLetterOrDigit(t)) out.append(t);
            else if (t == '(') ops.push(t);
            else if (t == ')') { while (ops.peek() != '(') out.append(ops.pop()); ops.pop(); }
            else { while (!ops.isEmpty() && ops.peek() != '(' && prec(ops.peek()) >= prec(t)) out.append(ops.pop()); ops.push(t); }
        }
        while (!ops.isEmpty()) out.append(ops.pop());
        return out.toString();
    }
    static int prec(char c) { return c == '|' ? 1 : c == '.' ? 2 : 3; }
    // 每個片段有一個起點與一個接受狀態；回傳 {起點, 接受}
    static int[] thompson(String re) {
        trans = new ArrayList<>(); n = 0;
        Deque<int[]> st = new ArrayDeque<>();
        for (char t : toPostfix(re).toCharArray()) {
            if (Character.isLetterOrDigit(t)) { int s = n++, a = n++; trans.add(new int[]{s, a, t}); st.push(new int[]{s, a}); }
            else if (t == '.') { int[] b = st.pop(), a = st.pop(); trans.add(new int[]{a[1], b[0], 0}); st.push(new int[]{a[0], b[1]}); }
            else if (t == '|') {
                int[] b = st.pop(), a = st.pop();
                int s = n++, e = n++;
                trans.add(new int[]{s, a[0], 0}); trans.add(new int[]{s, b[0], 0}); trans.add(new int[]{a[1], e, 0}); trans.add(new int[]{b[1], e, 0});
                st.push(new int[]{s, e});
            } else {
                int[] a = st.pop();
                int s = n++, e = n++;
                trans.add(new int[]{s, a[0], 0}); trans.add(new int[]{a[1], e, 0});
                if (t != '+') trans.add(new int[]{s, e, 0});
                if (t != '?') trans.add(new int[]{a[1], a[0], 0});
                st.push(new int[]{s, e});
            }
        }
        return st.pop();
    }
    static Set<Integer> closure(Set<Integer> cur) {
        Deque<Integer> stack = new ArrayDeque<>(cur);
        while (!stack.isEmpty()) { int u = stack.pop(); for (int[] t : trans) if (t[0] == u && t[2] == 0 && cur.add(t[1])) stack.push(t[1]); }
        return cur;
    }
    static boolean accepts(int[] m, String w) {
        Set<Integer> cur = closure(new HashSet<>(Set.of(m[0])));
        for (char ch : w.toCharArray()) {
            Set<Integer> nx = new HashSet<>();
            for (int[] t : trans) if (cur.contains(t[0]) && t[2] == ch) nx.add(t[1]);
            cur = closure(nx);
        }
        return cur.contains(m[1]);
    }

    public static void main(String[] args) {
        String[] res = {"(a|b)*abb", "a(b|c)*", "(ab)+c?"};
        String[][] tests = {{"abb", "aabb", "babb", "ab", "", "abab"}, {"a", "abcb", "b", "ac"}, {"ab", "ababc", "c", "abcc"}};
        for (int r = 0; r < 3; r++) {
            int[] m = thompson(res[r]);
            StringBuilder sb = new StringBuilder(res[r] + ": " + n + " states, " + trans.size() + " transitions;");
            for (String w : tests[r]) sb.append(' ').append(w.isEmpty() ? "ε" : w).append('=').append(accepts(m, w) ? 'Y' : 'N');
            System.out.println(sb);
        }
    }
}
