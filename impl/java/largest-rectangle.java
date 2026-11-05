import java.util.ArrayDeque;
import java.util.Deque;

public class LargestRectangle {
    // 單調遞增堆疊：柱子被彈出時，它的左右邊界就確定了，可算出以它為高的最大矩形
    public static void main(String[] args) {
        int[] h = {2, 1, 5, 6, 2, 3, 4, 1, 3};
        int n = h.length, best = 0, bl = 0, br = 0;
        Deque<Integer> st = new ArrayDeque<>();
        for (int i = 0; i <= n; i++) {
            int cur = i < n ? h[i] : 0; // 最後補一根高度 0 的柱子把堆疊清空
            while (!st.isEmpty() && h[st.peek()] >= cur) {
                int height = h[st.pop()];
                int left = st.isEmpty() ? 0 : st.peek() + 1;
                int area = height * (i - left);
                if (area > best) { best = area; bl = left; br = i - 1; }
            }
            st.push(i);
        }
        System.out.println("max area = " + best + ", bars [" + bl + ", " + br + "]");
    }
}
