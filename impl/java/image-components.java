import java.util.*;

public class ImageComponents {
    static final int N = 16;
    static int[] parent;
    static int find(int x) { while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }

    static int[][] make(int t) {
        int[][] a = new int[N][N];
        long s = 5;
        for (int r = 0; r < N; r++)
            for (int c = 0; c < N; c++)
                a[r][c] = (t == 2 ? (((r + c) % 4 == 0 && r % 2 == 0) || (r >= 10 && c >= 10 && (r + c) % 2 == 0)) : ((r - 5.5) * (r - 5.5) + (c - 5) * (c - 5) <= 16 || (r - 9) * (r - 9) + (c - 10.5) * (c - 10.5) <= 16 || (r - 13) * (r - 13) + (c - 2.5) * (c - 2.5) <= 3.5)) ? 1 : 0;
        if (t == 0) for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { s = s * 48271 % 2147483647; if (s % 100 < 6) a[r][c] = 1 - a[r][c]; }
        return a;
    }

    public static void main(String[] args) {
        String[] names = {"noisy blobs", "blobs", "diagonal dots"};
        int[][] D4 = {{-1, 0}, {0, -1}, {0, 1}, {1, 0}}, D8 = {{-1, -1}, {-1, 0}, {-1, 1}, {0, -1}, {0, 1}, {1, -1}, {1, 0}, {1, 1}};
        for (int t = 0; t < 3; t++) {
            int[][] A = make(t);
            for (int conn : new int[]{4, 8}) {
                // 第一趟看已掃過的鄰居，給新標籤或用並查集合併；第二趟換成代表並重新編號
                int[][] prev = conn == 8 ? new int[][]{{-1, -1}, {-1, 0}, {-1, 1}, {0, -1}} : new int[][]{{-1, 0}, {0, -1}};
                int[][] lab = new int[N][N];
                parent = new int[N * N + 1];
                int np = 0;
                for (int r = 0; r < N; r++)
                    for (int c = 0; c < N; c++) {
                        if (A[r][c] == 0) continue;
                        List<Integer> nbr = new ArrayList<>();
                        for (int[] d : prev) { int y = r + d[0], x = c + d[1]; if (y >= 0 && y < N && x >= 0 && x < N && lab[y][x] > 0) nbr.add(lab[y][x]); }
                        if (nbr.isEmpty()) { np++; parent[np] = np; lab[r][c] = np; continue; }
                        lab[r][c] = Collections.min(nbr);
                        for (int v : nbr) { int a = find(v), b = find(lab[r][c]); if (a != b) parent[Math.max(a, b)] = Math.min(a, b); }
                    }
                Map<Integer, Integer> remap = new HashMap<>();
                for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) if (lab[r][c] > 0) { int root = find(lab[r][c]); remap.putIfAbsent(root, remap.size() + 1); lab[r][c] = remap.get(root); }
                int n = remap.size(), nb = 0;
                int[][] lb = new int[N][N];
                for (int r = 0; r < N; r++)
                    for (int c = 0; c < N; c++) {
                        if (A[r][c] == 0 || lb[r][c] > 0) continue;
                        lb[r][c] = ++nb;
                        ArrayDeque<int[]> q = new ArrayDeque<>();
                        q.add(new int[]{r, c});
                        while (!q.isEmpty()) {
                            int[] p = q.poll();
                            for (int[] d : conn == 8 ? D8 : D4) { int y = p[0] + d[0], x = p[1] + d[1]; if (y >= 0 && y < N && x >= 0 && x < N && A[y][x] == 1 && lb[y][x] == 0) { lb[y][x] = nb; q.add(new int[]{y, x}); } }
                        }
                    }
                Map<Integer, Integer> pairs = new HashMap<>();
                boolean same = n == nb;
                for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) if (A[r][c] == 1) { Integer m = pairs.putIfAbsent(lab[r][c], lb[r][c]); if (m != null && m != lb[r][c]) same = false; }
                Integer[] sizes = new Integer[n];
                Arrays.fill(sizes, 0);
                for (int[] row : lab) for (int v : row) if (v > 0) sizes[v - 1]++;
                Arrays.sort(sizes, Collections.reverseOrder());
                StringBuilder sb = new StringBuilder();
                for (int k = 0; k < n; k++) sb.append(k > 0 ? ", " : "").append(sizes[k]);
                System.out.println(names[t] + ", " + conn + "-connected: " + n + " components (" + np + " provisional labels), sizes [" + sb + "], matches BFS " + (same ? "True" : "False"));
            }
        }
    }
}
