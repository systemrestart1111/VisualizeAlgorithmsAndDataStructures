public class HoughLines {
    public static void main(String[] args) {
        final int N = 16, TH = 60;
        int[][] E = new int[N][N];
        for (int c = 1; c <= 14; c++) E[4][c] = 1;
        for (int k = 1; k <= 14; k++) E[15 - k][k] = 1;
        for (int r = 7; r <= 15; r++) E[r][12] = 1;
        int D = (int) Math.ceil(Math.hypot(N, N)), npts = 0;
        int[][] acc = new int[2 * D + 1][TH];
        double[] cs = new double[TH], sn = new double[TH];
        for (int t = 0; t < TH; t++) { cs[t] = Math.cos(Math.toRadians(t * 3)); sn[t] = Math.sin(Math.toRadians(t * 3)); }
        // 每個邊緣點對 θ = 0°, 3°, …, 177° 投票給 ρ = round(x cos θ + y sin θ)
        for (int y = 0; y < N; y++)
            for (int x = 0; x < N; x++) {
                if (E[y][x] == 0) continue;
                npts++;
                for (int t = 0; t < TH; t++) acc[(int) Math.floor(x * cs[t] + y * sn[t] + 0.5) + D][t]++;
            }
        for (int thr : new int[]{8, 12}) {
            StringBuilder sb = new StringBuilder();
            // 取 5×5 鄰域內的峰值（θ 跨過 180° 時 ρ 變號）
            for (int i = 0; i <= 2 * D; i++)
                for (int t = 0; t < TH; t++) {
                    if (acc[i][t] < thr) continue;
                    boolean ok = true;
                    for (int a = -2; a <= 2; a++)
                        for (int b = -2; b <= 2; b++) {
                            if (a == 0 && b == 0) continue;
                            int y = i + a, tt = ((t + b) % TH + TH) % TH, yy = (t + b < 0 || t + b >= TH) ? 2 * D - y : y;
                            if (yy >= 0 && yy <= 2 * D && (acc[yy][tt] > acc[i][t] || (acc[yy][tt] == acc[i][t] && (a < 0 || (a == 0 && b < 0))))) ok = false;
                        }
                    if (ok) sb.append(sb.length() > 0 ? "; " : "").append("theta ").append(t * 3).append(", rho ").append(i - D).append(", votes ").append(acc[i][t]);
                }
            System.out.println(npts + " edge points, threshold " + thr + ": " + sb);
        }
    }
}
