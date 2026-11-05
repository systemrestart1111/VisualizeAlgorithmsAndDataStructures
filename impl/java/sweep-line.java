import java.util.ArrayList;
import java.util.List;
import java.util.TreeSet;

public class SweepLine {
    // 掃描線：把所有矩形的左右邊 x 當成事件排序；相鄰兩個事件之間的直條內，覆蓋的 y 長度固定
    public static void main(String[] args) {
        int[][] rects = {{1, 1, 6, 5}, {3, 3, 9, 8}, {7, 1, 11, 4}, {2, 6, 5, 10}}; // (x1, y1, x2, y2)
        TreeSet<Integer> xset = new TreeSet<>();
        for (int[] r : rects) { xset.add(r[0]); xset.add(r[2]); }
        Integer[] xs = xset.toArray(new Integer[0]);
        long total = 0;
        for (int k = 0; k + 1 < xs.length; k++) {
            int xa = xs[k], xb = xs[k + 1];
            List<int[]> ivs = new ArrayList<>(); // 這一條內有效的 y 區間
            for (int[] r : rects) if (r[0] <= xa && r[2] >= xb) ivs.add(new int[] {r[1], r[3]});
            ivs.sort((a, b) -> a[0] != b[0] ? a[0] - b[0] : a[1] - b[1]);
            int covered = 0, lo = 0, hi = 0;
            boolean have = false;
            for (int[] iv : ivs) { // 合併重疊的 y 區間
                if (!have || iv[0] > hi) {
                    if (have) covered += hi - lo;
                    lo = iv[0]; hi = iv[1]; have = true;
                } else hi = Math.max(hi, iv[1]);
            }
            if (have) covered += hi - lo;
            total += (long) covered * (xb - xa);
            System.out.println("x in [" + xa + ", " + xb + "): covered y = " + covered + ", area += " + covered * (xb - xa));
        }
        System.out.println("union area = " + total);
    }
}
