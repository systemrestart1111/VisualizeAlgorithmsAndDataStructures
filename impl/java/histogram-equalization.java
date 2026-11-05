public class HistogramEqualization {
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
                else if (name.equals("flat")) v = 120;
                a[r][c] = v;
            }
        return a;
    }

    public static void main(String[] args) {
        for (String name : new String[]{"lowcontrast", "shapes", "flat"}) {
            int[][] A = preset(name);
            int[] hist = new int[256], cdf = new int[256];
            for (int[] row : A) for (int v : row) hist[v]++;
            int s = 0, cmin = -1;
            for (int v = 0; v < 256; v++) { s += hist[v]; cdf[v] = s; if (cmin < 0 && s > 0) cmin = s; }
            // map[v] = round((CDF[v] − CDF_min) / (N − CDF_min) × 255)；常數影像原樣輸出
            if (cmin == N * N) { System.out.println(name + ": constant image, unchanged"); continue; }
            StringBuilder sb = new StringBuilder(name + ":");
            for (int v = 0; v < 256; v++) if (hist[v] > 0) sb.append(' ').append(v).append("->").append((int) Math.floor((cdf[v] - cmin) * 255.0 / (N * N - cmin) + 0.5));
            System.out.println(sb);
        }
    }
}
