import java.util.*;

public class Watershed {
    static final int N = 16;

    static double[][] terrain(int t) {
        double[][] H = new double[N][N];
        if (t == 1) {
            for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) H[r][c] = Math.min((r - 4) * (r - 4) + (c - 4) * (c - 4), (r - 11) * (r - 11) + (c - 11) * (c - 11)) / 4;
            return H;
        }
        boolean[][] B = new boolean[N][N];
        for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) B[r][c] = (r - 5.5) * (r - 5.5) + (c - 5) * (c - 5) <= 16 || (r - 9) * (r - 9) + (c - 10.5) * (c - 10.5) <= 16 || (r - 13) * (r - 13) + (c - 2.5) * (c - 2.5) <= 3.5;
        for (int r = 0; r < N; r++)
            for (int c = 0; c < N; c++) {
                if (!B[r][c]) { H[r][c] = 1; continue; }
                double best = 1e9;
                for (int y = 0; y < N; y++) for (int x = 0; x < N; x++) if (!B[y][x]) best = Math.min(best, Math.hypot(y - r, x - c));
                H[r][c] = -Math.floor(best * 10 + 0.5) / 10;
            }
        return H;
    }

    // 區域極小值各給一個編號；優先佇列每次取最低者（同高度先進先出），把未標記的鄰居標成同一編號
    static int watershed(double[][] H, int[][] lab) {
        int[][] D4 = {{-1, 0}, {0, -1}, {0, 1}, {1, 0}};
        boolean[][] seen = new boolean[N][N];
        int n = 0;
        for (int i = 0; i < N; i++)
            for (int j = 0; j < N; j++) {
                if (seen[i][j]) continue;
                List<int[]> comp = new ArrayList<>();
                comp.add(new int[]{i, j});
                seen[i][j] = true;
                boolean isMin = true;
                for (int k = 0; k < comp.size(); k++)
                    for (int[] d : D4) {
                        int y = comp.get(k)[0] + d[0], x = comp.get(k)[1] + d[1];
                        if (y < 0 || y >= N || x < 0 || x >= N) continue;
                        if (H[y][x] < H[i][j]) isMin = false;
                        else if (H[y][x] == H[i][j] && !seen[y][x]) { seen[y][x] = true; comp.add(new int[]{y, x}); }
                    }
                if (isMin) { n++; for (int[] p : comp) lab[p[0]][p[1]] = n; }
            }
        PriorityQueue<double[]> pq = new PriorityQueue<>((a, b) -> a[0] != b[0] ? Double.compare(a[0], b[0]) : Double.compare(a[1], b[1]));
        int seq = 0;
        for (int i = 0; i < N; i++) for (int j = 0; j < N; j++) if (lab[i][j] > 0) pq.add(new double[]{H[i][j], seq++, i, j});
        while (!pq.isEmpty()) {
            double[] it = pq.poll();
            int i = (int) it[2], j = (int) it[3];
            for (int[] d : D4) {
                int y = i + d[0], x = j + d[1];
                if (y >= 0 && y < N && x >= 0 && x < N && lab[y][x] == 0) { lab[y][x] = lab[i][j]; pq.add(new double[]{H[y][x], seq++, y, x}); }
            }
        }
        return n;
    }

    public static void main(String[] args) {
        String[] names = {"blob distance", "two basins"};
        for (int t = 0; t < 2; t++) {
            int[][] lab = new int[N][N];
            int n = watershed(terrain(t), lab), boundary = 0;
            Integer[] sizes = new Integer[n];
            Arrays.fill(sizes, 0);
            for (int r = 0; r < N; r++)
                for (int c = 0; c < N; c++) {
                    sizes[lab[r][c] - 1]++;
                    if ((c + 1 < N && lab[r][c + 1] != lab[r][c]) || (r + 1 < N && lab[r + 1][c] != lab[r][c])) boundary++;
                }
            Arrays.sort(sizes, Collections.reverseOrder());
            StringBuilder sb = new StringBuilder();
            for (int k = 0; k < n; k++) sb.append(k > 0 ? ", " : "").append(sizes[k]);
            System.out.println(names[t] + ": " + n + " regions, sizes [" + sb + "], watershed boundary pixels " + boundary);
        }
    }
}
