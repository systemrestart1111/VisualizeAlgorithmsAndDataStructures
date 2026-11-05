public class CrossProduct {
    // (A - O) × (B - O)：> 0 表示 B 在 OA 左側（逆時針），< 0 在右側，= 0 共線
    static long cross(long[] o, long[] a, long[] b) {
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    }

    public static void main(String[] args) {
        long[] O = {2, 2}, A = {8, 4};
        for (long[] B : new long[][] {{4, 8}, {9, 1}, {5, 3}, {11, 5}}) {
            long c = cross(O, A, B);
            String side = c > 0 ? "left (counter-clockwise)" : c < 0 ? "right (clockwise)" : "collinear";
            System.out.println(String.format("B=%d,%d: cross = %4d -> %s", B[0], B[1], c, side));
        }
    }
}
