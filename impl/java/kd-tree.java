import java.util.*;

public class KdTree {
    static class KD { int[] p; int axis; KD left, right; KD(int[] p, int a) { this.p = p; axis = a; } }

    // 交替以 x、y 的中位數切分
    static KD build(List<int[]> pts, int depth) {
        if (pts.isEmpty()) return null;
        int axis = depth % 2;
        List<int[]> s = new ArrayList<>(pts);
        s.sort((a, b) -> a[axis] != b[axis] ? Integer.compare(a[axis], b[axis]) : Integer.compare(a[1 - axis], b[1 - axis]));
        int m = s.size() / 2;
        KD n = new KD(s.get(m), axis);
        n.left = build(s.subList(0, m), depth + 1);
        n.right = build(s.subList(m + 1, s.size()), depth + 1);
        return n;
    }
    static int[] q, best;
    static long bd;
    static int visited;
    // 先走查詢點所在的一側；到切分線的距離小於目前最近距離才檢查另一側
    static void go(KD n) {
        if (n == null) return;
        visited++;
        long d = (long) (n.p[0] - q[0]) * (n.p[0] - q[0]) + (long) (n.p[1] - q[1]) * (n.p[1] - q[1]);
        if (d < bd) { bd = d; best = n.p; }
        long diff = q[n.axis] - n.p[n.axis];
        KD near = diff < 0 ? n.left : n.right, far = diff < 0 ? n.right : n.left;
        go(near);
        if (diff * diff < bd) go(far);
    }
    static String s(int[] p) { return "(" + p[0] + ", " + p[1] + ")"; }

    public static void main(String[] args) {
        int[][] arr = {{30, 40}, {5, 25}, {70, 70}, {10, 12}, {50, 30}, {35, 45}, {80, 15}, {60, 85}, {20, 75}, {90, 55}, {45, 60}};
        List<int[]> pts = Arrays.asList(arr);
        KD root = build(pts, 0);
        System.out.println("root: " + s(root.p) + " | left: " + s(root.left.p) + " | right: " + s(root.right.p));
        for (int[] qq : new int[][]{{52, 52}, {12, 20}, {95, 95}, {0, 100}}) {
            q = qq; bd = Long.MAX_VALUE; visited = 0;
            go(root);
            long brute = Long.MAX_VALUE;
            for (int[] p : arr) brute = Math.min(brute, (long) (p[0] - q[0]) * (p[0] - q[0]) + (long) (p[1] - q[1]) * (p[1] - q[1]));
            System.out.printf("nearest to %s: %s dist %.2f visited %d/%d brute %.2f%n", s(q), s(best), Math.sqrt(bd), visited, arr.length, Math.sqrt(brute));
        }
    }
}
