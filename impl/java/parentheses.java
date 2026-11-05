import java.util.ArrayDeque;
import java.util.Deque;

public class Parentheses {
    // 遇到左括號就推入堆疊；遇到右括號時，堆疊頂端必須是對應的左括號
    static boolean isBalanced(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') stack.push(c);
            else if (c == ')' || c == ']' || c == '}') {
                char want = c == ')' ? '(' : c == ']' ? '[' : '{';
                if (stack.isEmpty() || stack.pop() != want) return false;
            }
        }
        return stack.isEmpty();
    }

    public static void main(String[] args) {
        for (String s : new String[] {"{[()()]}([]{})", "{[(])}", "(("})
            System.out.println(s + " -> " + (isBalanced(s) ? "True" : "False"));
    }
}
