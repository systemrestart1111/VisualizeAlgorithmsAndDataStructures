import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MonotoneChain {
    static long cross(long[] o, long[] a, long[] b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }

    // 依 (x, y) 排序後，左到右建下凸殼、右到左建上凸殼，兩者接起來就是凸包（不需算角度）
    static List<long[]> monotoneChain(long[][] pts) {
        Arrays.sort(pts, (a, b) -> a[0] != b[0] ? Long.compare(a[0], b[0]) : Long.compare(a[1], b[1]));
        List<long[]> lower = new ArrayList<>(), upper = new ArrayList<>();
        for (long[] p : pts) {
            while (lower.size() >= 2 && cross(lower.get(lower.size() - 2), lower.get(lower.size() - 1), p) <= 0) lower.remove(lower.size() - 1);
            lower.add(p);
        }
        for (int i = pts.length - 1; i >= 0; i--) {
            long[] p = pts[i];
            while (upper.size() >= 2 && cross(upper.get(upper.size() - 2), upper.get(upper.size() - 1), p) <= 0) upper.remove(upper.size() - 1);
            upper.add(p);
        }
        List<long[]> hull = new ArrayList<>(lower.subList(0, lower.size() - 1));
        hull.addAll(upper.subList(0, upper.size() - 1));
        return hull;
    }

    public static void main(String[] args) {
        long[][] pts = {{3, 1}, {7, 2}, {10, 5}, {6, 4}, {2, 6}, {5, 7}, {8, 9}, {1, 3}, {4, 4}, {9, 7}, {6, 10}, {3, 9}, {7, 6}};
        StringBuilder sb = new StringBuilder("hull (counter-clockwise):");
        for (long[] p : monotoneChain(pts)) sb.append(" (").append(p[0]).append(',').append(p[1]).append(')');
        System.out.println(sb);
    }
}
