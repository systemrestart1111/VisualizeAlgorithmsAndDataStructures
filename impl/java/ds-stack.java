import java.util.ArrayList;
import java.util.List;

public class StackDemo {
    // 後進先出（LIFO）：只在頂端 push / pop，都是 O(1)
    static class Stack {
        List<Integer> items = new ArrayList<>();

        void push(int v) { items.add(v); }
        int pop() { return items.remove(items.size() - 1); }
        int peek() { return items.get(items.size() - 1); }

        public String toString() {
            StringBuilder sb = new StringBuilder("bottom [");
            for (int i = 0; i < items.size(); i++) sb.append(i > 0 ? " " : "").append(items.get(i));
            return sb.append("] top").toString();
        }
    }

    public static void main(String[] args) {
        Stack s = new Stack();
        for (int v : new int[] {4, 8, 15}) { s.push(v); System.out.println(String.format("push %2d: %s", v, s)); }
        System.out.println("peek -> " + s.peek());
        for (int i = 0; i < 2; i++) { int v = s.pop(); System.out.println("pop -> " + v + ": " + s); }
        s.push(16); System.out.println("push 16: " + s);
    }
}
