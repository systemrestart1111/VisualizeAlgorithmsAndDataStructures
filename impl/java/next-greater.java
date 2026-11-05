import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Deque;
import java.util.stream.Collectors;

public class NextGreater {
    // 單調遞減堆疊：新元素比堆疊頂端大時，頂端的「下一個較大元素」就是它
    static int[] nextGreater(int[] a) {
        int[] res = new int[a.length];
        Arrays.fill(res, -1);
        Deque<Integer> st = new ArrayDeque<>(); // 存索引
        for (int i = 0; i < a.length; i++) {
            while (!st.isEmpty() && a[st.peek()] < a[i]) res[st.pop()] = a[i];
            st.push(i);
        }
        return res;
    }

    public static void main(String[] args) {
        int[] r = nextGreater(new int[] {4, 5, 2, 10, 8, 3, 7, 1, 9, 6});
        System.out.println(Arrays.stream(r).mapToObj(String::valueOf).collect(Collectors.joining(" ")));
    }
}
