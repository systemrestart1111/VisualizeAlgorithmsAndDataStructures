import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.PriorityQueue;

public class TopK {
    // 維持大小為 k 的最小堆積：比堆頂大的元素才換進來，最後堆內就是最大的 k 個
    static List<Integer> topK(int[] a, int k) {
        PriorityQueue<Integer> heap = new PriorityQueue<>();
        for (int x : a) {
            if (heap.size() < k) heap.add(x);
            else if (x > heap.peek()) { heap.poll(); heap.add(x); }
        }
        List<Integer> out = new ArrayList<>(heap);
        out.sort(Collections.reverseOrder());
        return out;
    }

    public static void main(String[] args) {
        int[] a = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47};
        StringBuilder sb = new StringBuilder("top 4:");
        for (int x : topK(a, 4)) sb.append(' ').append(x);
        System.out.println(sb);
    }
}
