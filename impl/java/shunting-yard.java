import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;
import java.util.Map;

public class ShuntingYard {
    // 調度場演算法：支援函式、逗號參數與一元負號，輸出後序（RPN）再求值
    static final Map<String, Double> PREC = Map.of("+", 1.0, "-", 1.0, "*", 2.0, "/", 2.0, "neg", 2.5, "^", 3.0);

    static boolean isFunc(String o) { return o.equals("max") || o.equals("min") || o.equals("sqrt") || o.equals("abs"); }

    static String fmt(double x) { return x == Math.floor(x) ? String.valueOf((long) x) : String.format("%.4f", x); }

    static List<Object> toRpn(String s) {
        List<Object> out = new ArrayList<>(); // Double 為數值，String 為運算子或函式
        Deque<String> ops = new ArrayDeque<>();
        boolean prevValue = false; // 前一個 token 是否為數值或右括號
        for (int i = 0; i < s.length();) {
            char c = s.charAt(i);
            if (c == ' ') { i++; continue; }
            if (Character.isDigit(c)) {
                int j = i;
                while (j < s.length() && (Character.isDigit(s.charAt(j)) || s.charAt(j) == '.')) j++;
                out.add(Double.parseDouble(s.substring(i, j)));
                i = j;
                prevValue = true;
            } else if (Character.isLetter(c)) {
                int j = i;
                while (j < s.length() && Character.isLetter(s.charAt(j))) j++;
                ops.push(s.substring(i, j));
                i = j;
                prevValue = false;
            } else {
                i++;
                if (c == '(') { ops.push("("); prevValue = false; }
                else if (c == ',' || c == ')') {
                    while (!ops.peek().equals("(")) out.add(ops.pop());
                    if (c == ')') {
                        ops.pop();
                        if (!ops.isEmpty() && isFunc(ops.peek())) out.add(ops.pop());
                        prevValue = true;
                    } else prevValue = false;
                } else {
                    String t = String.valueOf(c);
                    if (c == '-' && !prevValue) t = "neg"; // 一元負號
                    else
                        while (!ops.isEmpty() && PREC.containsKey(ops.peek())
                                && (PREC.get(ops.peek()) > PREC.get(t) || (PREC.get(ops.peek()).equals(PREC.get(t)) && !t.equals("^"))))
                            out.add(ops.pop());
                    ops.push(t);
                    prevValue = false;
                }
            }
        }
        while (!ops.isEmpty()) out.add(ops.pop());
        return out;
    }

    static double evalRpn(List<Object> rpn) {
        Deque<Double> st = new ArrayDeque<>();
        for (Object t : rpn) {
            if (t instanceof Double) { st.push((Double) t); continue; }
            String o = (String) t;
            switch (o) {
                case "neg": st.push(-st.pop()); break;
                case "sqrt": st.push(Math.sqrt(st.pop())); break;
                case "abs": st.push(Math.abs(st.pop())); break;
                default: {
                    double b = st.pop(), a = st.pop();
                    st.push(switch (o) {
                        case "max" -> Math.max(a, b);
                        case "min" -> Math.min(a, b);
                        case "+" -> a + b;
                        case "-" -> a - b;
                        case "*" -> a * b;
                        case "/" -> a / b;
                        default -> Math.pow(a, b);
                    });
                }
            }
        }
        return st.pop();
    }

    public static void main(String[] args) {
        List<Object> rpn = toRpn("3 + max(4, 2 * 5) * -2 ^ 2 - sqrt(16)");
        StringBuilder sb = new StringBuilder("RPN:");
        for (Object t : rpn) sb.append(' ').append(t instanceof Double ? fmt((Double) t) : t);
        System.out.println(sb);
        System.out.println("value = " + fmt(evalRpn(rpn)));
    }
}
