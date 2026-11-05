public class NonmaximumSuppression {
    static final int N = 16;
    static int[][] S = new int[N][N];

    // 不小於視窗內所有鄰居才保留；相等時只留光柵順序最早的
    static void nms(int rad, int thr) {
        StringBuilder sb = new StringBuilder();
        int n = 0;
        for (int i = 0; i < N; i++)
            for (int j = 0; j < N; j++) {
                if (S[i][j] < thr) continue;
                boolean ok = true;
                for (int a = -rad; a <= rad; a++)
                    for (int b = -rad; b <= rad; b++) {
                        int y = i + a, x = j + b;
                        if ((a != 0 || b != 0) && y >= 0 && y < N && x >= 0 && x < N && (S[y][x] > S[i][j] || (S[y][x] == S[i][j] && (a < 0 || (a == 0 && b < 0))))) ok = false;
                    }
                if (ok) { n++; sb.append(" (").append(i).append(',').append(j).append(")=").append(S[i][j]); }
            }
        System.out.println("window " + (2 * rad + 1) + "x" + (2 * rad + 1) + ", threshold " + thr + ": " + n + " kept:" + sb);
    }

    public static void main(String[] args) {
        int[][] bumps = {{3, 3, 100}, {3, 6, 100}, {10, 4, 80}, {8, 12, 120}, {13, 13, 60}};
        for (int r = 0; r < N; r++)
            for (int c = 0; c < N; c++) {
                double s = 0;
                for (int[] b : bumps) s += b[2] * Math.exp(-((r - b[0]) * (r - b[0]) + (c - b[1]) * (c - b[1])) / 3.0);
                S[r][c] = (int) Math.floor(s + 0.5);
            }
        S[12][7] = S[12][8] = S[13][7] = S[13][8] = 70;
        nms(1, 30);
        nms(2, 30);
        nms(1, 80);
    }
}
