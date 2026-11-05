import java.util.*;

public class IntervalMerge {
    // 依左端點排序；touch=true 時相接的閉區間（如 [1,3] 與 [3,5]）也合併
    static List<int[]> merge(int[][] iv, boolean touch) {
        int[][] s = iv.clone();
        Arrays.sort(s, (a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(a[1], b[1]));
        List<int[]> out = new ArrayList<>();
        for (int[] p : s) {
            if (!out.isEmpty() && (touch ? p[0] <= out.get(out.size() - 1)[1] : p[0] < out.get(out.size() - 1)[1])) {
                int[] last = out.get(out.size() - 1);
                last[1] = Math.max(last[1], p[1]);
            } else out.add(new int[]{p[0], p[1]});
        }
        return out;
    }
    static String fmt(List<int[]> v) { StringBuilder sb = new StringBuilder(); for (int[] p : v) sb.append(sb.length() > 0 ? " " : "").append("[").append(p[0]).append(",").append(p[1]).append("]"); return sb.toString(); }

    public static void main(String[] args) {
        int[][] iv = {{1, 3}, {8, 10}, {2, 6}, {10, 12}, {15, 18}, {17, 20}};
        System.out.println("merge touching: " + fmt(merge(iv, true)));
        System.out.println("keep touching : " + fmt(merge(iv, false)));
        System.out.println("single        : " + fmt(merge(new int[][]{{5, 5}}, true)));
    }
}
