public class SparseTable {
    static int[][] st;

    // st[j][i] = min(a[i .. i + 2^j − 1])
    static void build(int[] a) {
        int levels = 32 - Integer.numberOfLeadingZeros(a.length);
        st = new int[levels][];
        st[0] = a.clone();
        for (int j = 1; j < levels; j++) {
            st[j] = new int[a.length - (1 << j) + 1];
            for (int i = 0; i < st[j].length; i++) st[j][i] = Math.min(st[j - 1][i], st[j - 1][i + (1 << (j - 1))]);
        }
    }
    // 兩段長度 2^k 的區間可以重疊：只適用於 min／max／gcd 等冪等運算
    static int query(int l, int r) {
        int k = 31 - Integer.numberOfLeadingZeros(r - l + 1);
        return Math.min(st[k][l], st[k][r - (1 << k) + 1]);
    }

    public static void main(String[] args) {
        int[] a = {5, 2, 8, 6, 3, 7, 1, 9, 4, 6, 2, 8};
        build(a);
        for (int j = 0; j < st.length; j++) { StringBuilder sb = new StringBuilder("2^" + j + ":"); for (int x : st[j]) sb.append(' ').append(x); System.out.println(sb); }
        int[][] qs = {{0, 4}, {3, 9}, {6, 6}, {0, 11}, {8, 11}, {2, 5}};
        for (int[] q : qs) {
            int b = a[q[0]];
            for (int i = q[0]; i <= q[1]; i++) b = Math.min(b, a[i]);
            System.out.println("min[" + q[0] + ", " + q[1] + "] = " + query(q[0], q[1]) + " (brute " + b + ")");
        }
    }
}
