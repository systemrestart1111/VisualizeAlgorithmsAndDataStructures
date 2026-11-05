import java.util.ArrayDeque;
import java.util.Deque;
import java.util.StringJoiner;

public class InfixToPostfix {
    static int prec(char c) { return c == '^' ? 3 : (c == '*' || c == '/') ? 2 : 1; }

    // 運算元直接輸出；運算子進堆疊前，先彈出優先權較高（或相同且左結合）的運算子
    static String toPostfix(String expr) {
        StringJoiner out = new StringJoiner(" ");
        Deque<Character> st = new ArrayDeque<>();
        for (char c : expr.toCharArray()) {
            if (c == ' ') continue;
            if (Character.isLetterOrDigit(c)) out.add(String.valueOf(c));
            else if (c == '(') st.push(c);
            else if (c == ')') {
                while (st.peek() != '(') out.add(String.valueOf(st.pop()));
                st.pop();
            } else {
                while (!st.isEmpty() && st.peek() != '(' && (prec(st.peek()) > prec(c) || (prec(st.peek()) == prec(c) && c != '^')))
                    out.add(String.valueOf(st.pop()));
                st.push(c);
            }
        }
        while (!st.isEmpty()) out.add(String.valueOf(st.pop()));
        return out.toString();
    }

    public static void main(String[] args) {
        System.out.println(toPostfix("A + B * (C - D) / E ^ F ^ G"));
    }
}
