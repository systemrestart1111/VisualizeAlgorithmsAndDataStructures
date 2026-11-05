public class EggDropping {
    // f(m, e) = f(m−1, e−1) + f(m−1, e) + 1：m 次、e 顆蛋最多能區分的樓層數
    static int minDrops(int k, int n) {
        if (n == 0) return 0;
        long[] f = new long[k + 1];
        int m = 0;
        while (f[k] < n) {
            m++;
            for (int e = k; e >= 1; e--) f[e] = f[e - 1] + f[e] + 1;
        }
        return m;
    }

    public static void main(String[] args) {
        int[][] tests = {{2, 36}, {1, 10}, {3, 100}, {2, 0}, {2, 100}, {4, 5000}};
        for (int[] t : tests) System.out.println(t[0] + " eggs, " + t[1] + " floors: " + minDrops(t[0], t[1]) + " drops");
    }
}
