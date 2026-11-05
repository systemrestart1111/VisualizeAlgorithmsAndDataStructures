import java.util.*;

public class StreamingMedian {
    // 左半最大堆積、右半最小堆積；保持 |左| = |右| 或 |右| + 1
    static PriorityQueue<Integer> lo = new PriorityQueue<>(Comparator.reverseOrder()), hi = new PriorityQueue<>();

    static void add(int x) {
        if (lo.isEmpty() || x <= lo.peek()) lo.add(x); else hi.add(x);
        if (lo.size() > hi.size() + 1) hi.add(lo.poll());
        else if (hi.size() > lo.size()) lo.add(hi.poll());
    }
    static double median() { return lo.size() > hi.size() ? lo.peek() : (lo.peek() + hi.peek()) / 2.0; }

    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder();
        for (int x : new int[]{5, 15, 1, 3, 8, 7, 9, 10, 20, -4, 7, 7}) { add(x); sb.append(sb.length() > 0 ? " " : "").append(String.format("%d->%.1f", x, median())); }
        System.out.println(sb);
    }
}
