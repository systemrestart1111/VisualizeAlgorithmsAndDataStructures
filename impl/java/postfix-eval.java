import java.util.ArrayDeque;
import java.util.Deque;

public class PostfixEval {
    // 數字推入堆疊；遇到運算子就彈出兩個數計算，結果再推回去
    static long evalPostfix(String expr) {
        Deque<Long> st = new ArrayDeque<>();
        for (String tok : expr.trim().split("\\s+")) {
            switch (tok) {
                case "+": case "-": case "*": case "/": {
                    long b = st.pop(), a = st.pop();
                    st.push(tok.equals("+") ? a + b : tok.equals("-") ? a - b : tok.equals("*") ? a * b : a / b);
                    break;
                }
                default: st.push(Long.parseLong(tok));
            }
        }
        return st.pop();
    }

    public static void main(String[] args) {
        System.out.println(evalPostfix("5 1 2 + 4 * + 3 -"));
    }
}
