import java.util.Arrays;
import java.util.PriorityQueue;

public class IntervalPartitioning {
    // 依開始時間處理；最小堆積存 (結束時間, 教室編號)，最早空出的教室若來得及就沿用，否則開新教室
    public static void main(String[] args) {
        int[][] iv = {{0, 3}, {1, 4}, {2, 6}, {4, 7}, {5, 9}, {6, 8}, {7, 10}, {9, 12}, {8, 11}, {11, 13}};
        Arrays.sort(iv, (a, b) -> a[0] != b[0] ? a[0] - b[0] : a[1] - b[1]);
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> a[0] != b[0] ? a[0] - b[0] : a[1] - b[1]);
        int rooms = 0;
        for (int[] p : iv) {
            int r;
            if (!heap.isEmpty() && heap.peek()[0] <= p[0]) r = heap.poll()[1];
            else r = rooms++;
            heap.add(new int[] {p[1], r});
            System.out.println("[" + p[0] + "," + p[1] + ") -> room " + r);
        }
        System.out.println("rooms needed = " + rooms);
    }
}
