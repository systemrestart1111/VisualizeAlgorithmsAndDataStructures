public class SqrtDecomposition {
    static int[] a = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3};
    static final int B = 4;
    static int[] sums = new int[(a.length + B - 1) / B];

    static void set(int i, int v) { sums[i / B] += v - a[i]; a[i] = v; }
    // 完整的塊直接用總和，兩端零散元素逐一相加
    static int query(int l, int r) {
        int s = 0, i = l;
        while (i <= r) {
            if (i % B == 0 && i + B - 1 <= r) { s += sums[i / B]; i += B; }
            else s += a[i++];
        }
        return s;
    }
    static String blocks() { StringBuilder sb = new StringBuilder(); for (int s : sums) sb.append(' ').append(s); return sb.toString(); }

    public static void main(String[] args) {
        for (int i = 0; i < a.length; i++) sums[i / B] += a[i];
        System.out.println("blocks:" + blocks());
        System.out.println("sum[2, 13] = " + query(2, 13));
        set(5, 0);
        System.out.println("after a[5] = 0, blocks:" + blocks());
        System.out.println("sum[4, 7] = " + query(4, 7) + " | sum[0, 15] = " + query(0, 15) + " | sum[9, 9] = " + query(9, 9));
    }
}
