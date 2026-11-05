import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.PriorityQueue;

public class ExternalMergeSort {
    // 記憶體只能放 m 筆：先切成長度 m 的有序 run，再用最小堆積做 k 路合併
    static List<Integer> externalSort(int[] data, int m) {
        List<int[]> runs = new ArrayList<>();
        for (int i = 0; i < data.length; i += m) {
            int[] r = Arrays.copyOfRange(data, i, Math.min(data.length, i + m));
            Arrays.sort(r);
            StringBuilder sb = new StringBuilder("run " + runs.size() + ":");
            for (int x : r) sb.append(' ').append(x);
            System.out.println(sb);
            runs.add(r);
        }
        // 堆積元素：{值, run 編號, run 內位置}
        PriorityQueue<int[]> pq = new PriorityQueue<>((x, y) -> x[0] != y[0] ? Integer.compare(x[0], y[0]) : Integer.compare(x[1], y[1]));
        for (int i = 0; i < runs.size(); i++) pq.add(new int[] {runs.get(i)[0], i, 0});
        List<Integer> out = new ArrayList<>();
        while (!pq.isEmpty()) {
            int[] t = pq.poll();
            out.add(t[0]);
            int[] r = runs.get(t[1]);
            if (t[2] + 1 < r.length) pq.add(new int[] {r[t[2] + 1], t[1], t[2] + 1});
        }
        return out;
    }

    public static void main(String[] args) {
        int[] data = {41, 7, 63, 22, 88, 15, 34, 70, 2, 56, 29, 93, 11, 47, 80, 38, 5, 66};
        StringBuilder sb = new StringBuilder("merged:");
        for (int x : externalSort(data, 4)) sb.append(' ').append(x);
        System.out.println(sb);
    }
}
