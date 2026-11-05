public class WeightedDsu {
    static int[] p = new int[8], d = new int[8];   // d[x] = val[x] − val[parent[x]]

    // 回傳 {根, val[x] − val[根]}；路徑壓縮時把差值累加起來
    static int[] find(int x) {
        if (p[x] == x) return new int[]{x, 0};
        int[] r = find(p[x]);
        d[x] += r[1];
        p[x] = r[0];
        return new int[]{r[0], d[x]};
    }
    // 加入條件 val[x] − val[y] = w；與既有關係矛盾時回傳 false
    static boolean relate(int x, int y, int w) {
        int[] a = find(x), b = find(y);
        if (a[0] == b[0]) return a[1] - b[1] == w;
        p[a[0]] = b[0];
        d[a[0]] = w - a[1] + b[1];
        return true;
    }
    static Integer diff(int x, int y) {
        int[] a = find(x), b = find(y);
        return a[0] == b[0] ? a[1] - b[1] : null;
    }

    public static void main(String[] args) {
        for (int i = 0; i < 8; i++) p[i] = i;
        int[][] rel = {{1, 0, 3}, {2, 1, 2}, {4, 3, -1}, {5, 4, 4}}, qs = {{2, 0}, {5, 3}, {0, 2}, {2, 5}};
        for (int[] e : rel) relate(e[0], e[1], e[2]);
        for (int[] q : qs) { Integer r = diff(q[0], q[1]); System.out.println("val[" + q[0] + "] - val[" + q[1] + "] = " + (r == null ? "unknown" : r.toString())); }
        System.out.println("relate(5, 2, 1): " + (relate(5, 2, 1) ? "True" : "False"));
        System.out.println("val[3] - val[0] = " + diff(3, 0));
        boolean a = relate(3, 0, 0), b = relate(3, 0, -4);
        System.out.println("relate(3, 0, 0) consistent: " + (a ? "True" : "False") + " | relate(3, 0, -4) consistent: " + (b ? "True" : "False"));
    }
}
