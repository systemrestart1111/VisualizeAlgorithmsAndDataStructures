public class Otsu {
    static final int N = 16;

    static int[][] preset(String name) {
        int[][] a = new int[N][N];
        for (int r = 0; r < N; r++)
            for (int c = 0; c < N; c++) {
                int v = 30;
                if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
                if ((r - 10.5) * (r - 10.5) + (c - 10.5) * (c - 10.5) <= 12.96) v = 140;
                if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
                if (name.equals("lowcontrast")) v = 95 + (int) Math.floor((v - 30) / 170.0 * 35 + 0.5) + (r / 4) * 3;
                else if (name.equals("step")) v = (c < 8 ? 60 : 190) + (r >= 11 ? 40 : 0);
                else if (name.equals("flat")) v = 120;
                a[r][c] = v;
            }
        return a;
    }

    public static void main(String[] args) {
        for (String name : new String[]{"shapes", "lowcontrast", "step", "flat"}) {
            int[][] A = preset(name);
            int[] hist = new int[256];
            for (int[] row : A) for (int v : row) hist[v]++;
            int levels = 0, only = 0;
            for (int v = 0; v < 256; v++) if (hist[v] > 0) { levels++; only = v; }
            if (levels == 1) { System.out.println(name + ": single gray level, t = " + only + ", all background"); continue; }
            // 最大化類間變異數 ω₀ω₁(μ₀ − μ₁)²；空類別跳過
            double total = 0, best = -1, sum0 = 0;
            int w0 = 0, bt = 0, P = N * N;
            for (int v = 0; v < 256; v++) total += (double) v * hist[v];
            for (int t = 0; t < 256; t++) {
                w0 += hist[t];
                sum0 += (double) hist[t] * t;
                int w1 = P - w0;
                if (w0 == 0 || w1 == 0) continue;
                double m0 = sum0 / w0, m1 = (total - sum0) / w1;
                double sb = ((double) w0 / P) * ((double) w1 / P) * (m0 - m1) * (m0 - m1);
                if (sb > best) { best = sb; bt = t; }
            }
            int fg = 0;
            for (int[] row : A) for (int v : row) if (v > bt) fg++;
            System.out.println(String.format("%s: t = %d, between-class variance %.3f, foreground %d pixels", name, bt, best, fg));
        }
    }
}
