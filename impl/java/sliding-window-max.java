import java.util.ArrayDeque;
import java.util.Deque;
import java.util.StringJoiner;

public class SlidingWindowMax {
    // 單調遞減雙端佇列（存索引）：隊首永遠是視窗內最大值的位置
    public static void main(String[] args) {
        int[] a = {1, 3, -1, -3, 5, 3, 6, 7, 2, 4, 1};
        int k = 3;
        Deque<Integer> dq = new ArrayDeque<>();
        StringJoiner out = new StringJoiner(" ");
        for (int i = 0; i < a.length; i++) {
            while (!dq.isEmpty() && a[dq.peekLast()] <= a[i]) dq.pollLast(); // 比 a[i] 小的元素再也不會成為最大值
            dq.addLast(i);
            if (dq.peekFirst() <= i - k) dq.pollFirst();                    // 隊首已離開視窗
            if (i >= k - 1) out.add(String.valueOf(a[dq.peekFirst()]));
        }
        System.out.println(out);
    }
}
