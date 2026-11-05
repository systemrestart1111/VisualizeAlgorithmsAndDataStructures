public class ImageConvolution {
    static final int N = 16;
    static int[][] A = new int[N][N];

    static void shapes() {
        for (int r = 0; r < N; r++)
            for (int c = 0; c < N; c++) {
                int v = 30;
                if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
                if ((r - 10.5) * (r - 10.5) + (c - 10.5) * (c - 10.5) <= 12.96) v = 140;
                if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
                A[r][c] = v;
            }
    }
    static int ref(int i) { while (i < 0 || i >= N) i = i < 0 ? -i : 2 * (N - 1) - i; return i; }
    // 超出範圍時依邊界模式取值：補 0、複製邊緣、鏡射
    static int at(int r, int c, String mode) {
        if (r >= 0 && r < N && c >= 0 && c < N) return A[r][c];
        if (mode.equals("zero")) return 0;
        if (mode.equals("replicate")) return A[Math.min(N - 1, Math.max(0, r))][Math.min(N - 1, Math.max(0, c))];
        return A[ref(r)][ref(c)];
    }

    public static void main(String[] args) {
        shapes();
        String[] names = {"sharpen", "laplace", "emboss"};
        int[][][] K = {{{0, -1, 0}, {-1, 5, -1}, {0, -1, 0}}, {{0, 1, 0}, {1, -4, 1}, {0, 1, 0}}, {{-2, -1, 0}, {-1, 1, 1}, {0, 1, 2}}};
        for (int k = 0; k < 3; k++)
            for (String mode : new String[]{"zero", "replicate", "reflect"}) {
                // 相關運算：核心中心對準像素，對應位置相乘後加總
                int[][] out = new int[N][N];
                int sum = 0, mn = Integer.MAX_VALUE, mx = Integer.MIN_VALUE;
                for (int r = 0; r < N; r++)
                    for (int c = 0; c < N; c++) {
                        int s = 0;
                        for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) s += K[k][i + 1][j + 1] * at(r + i, c + j, mode);
                        out[r][c] = s;
                        sum += s; mn = Math.min(mn, s); mx = Math.max(mx, s);
                    }
                System.out.println(names[k] + "/" + mode + ": sum " + sum + ", out(0,0) = " + out[0][0] + ", out(5,4) = " + out[5][4] + ", min " + mn + ", max " + mx);
            }
    }
}
