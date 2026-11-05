public class PrefixSum {
    // p[i] = a[0] + … + a[i-1]；區間和 a[l..r] = p[r+1] - p[l]，查詢 O(1)
    static long[] buildPrefix(int[] a) {
        long[] p = new long[a.length + 1];
        for (int i = 0; i < a.length; i++) p[i + 1] = p[i] + a[i];
        return p;
    }

    public static void main(String[] args) {
        int[] a = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3};
        long[] p = buildPrefix(a);
        StringBuilder sb = new StringBuilder("prefix:");
        for (long x : p) sb.append(' ').append(x);
        System.out.println(sb);
        System.out.println("sum[2..6] = " + (p[7] - p[2]));
    }
}
