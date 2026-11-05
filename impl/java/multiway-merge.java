import java.util.*;

public class MultiwayMerge {
    // 最小堆積放 (值, 串列編號, 位置)，每次取最小者並補上同串列的下一個
    static List<Integer> kwayMerge(int[][] lists) {
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(a[1], b[1]));
        for (int i = 0; i < lists.length; i++) if (lists[i].length > 0) pq.add(new int[]{lists[i][0], i, 0});
        List<Integer> out = new ArrayList<>();
        while (!pq.isEmpty()) {
            int[] t = pq.poll();
            out.add(t[0]);
            if (t[2] + 1 < lists[t[1]].length) pq.add(new int[]{lists[t[1]][t[2] + 1], t[1], t[2] + 1});
        }
        return out;
    }
    static String show(List<Integer> v) { StringBuilder sb = new StringBuilder(); for (int i = 0; i < v.size(); i++) sb.append(i > 0 ? " " : "").append(v.get(i)); return sb.toString(); }

    public static void main(String[] args) {
        System.out.println(show(kwayMerge(new int[][]{{1, 4, 9, 12}, {2, 3, 10}, {}, {5}, {6, 7, 8, 11, 13}})));
        System.out.println(show(kwayMerge(new int[][]{{}, {}})) + " (empty)");
        System.out.println(show(kwayMerge(new int[][]{{1, 1, 2}, {1, 3}})));
    }
}
