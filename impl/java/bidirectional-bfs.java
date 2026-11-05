import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class BidirectionalBFS {
    static String[] GRID = {"S.....#.........", ".####.#.#######.", ".#....#.......#.", ".#.#######.##.#.", ".#..........#...",
                            ".#######.#.###.#", ".........#...#..", "########.####.#.", "..............#E"};
    static int R = GRID.length, C = GRID[0].length();
    static int[] DR = {0, 1, 0, -1}, DC = {1, 0, -1, 0};
    static int bestLen = -1, bestCell = -1;

    // 把一側展開一整層；若碰到另一側已拜訪的格子，記下最短的接合點
    static List<Integer> expand(List<Integer> frontier, int[] dist, int[] other) {
        List<Integer> nxt = new ArrayList<>();
        for (int u : frontier) {
            int r = u / C, c = u % C;
            for (int d = 0; d < 4; d++) {
                int nr = r + DR[d], nc = c + DC[d], v = nr * C + nc;
                if (nr < 0 || nr >= R || nc < 0 || nc >= C || GRID[nr].charAt(nc) == '#') continue;
                if (other[v] >= 0) {
                    int cand = dist[u] + 1 + other[v];
                    if (bestLen < 0 || cand < bestLen) { bestLen = cand; bestCell = v; }
                }
                if (dist[v] < 0) { dist[v] = dist[u] + 1; nxt.add(v); }
            }
        }
        return nxt;
    }

    // 從起點與終點同時做 BFS，每次展開較小的那一側；兩邊相遇時即得最短路徑
    public static void main(String[] args) {
        int[] ds = new int[R * C], de = new int[R * C];
        Arrays.fill(ds, -1);
        Arrays.fill(de, -1);
        List<Integer> fs = new ArrayList<>(), fe = new ArrayList<>();
        for (int r = 0; r < R; r++)
            for (int c = 0; c < C; c++) {
                if (GRID[r].charAt(c) == 'S') { fs.add(r * C + c); ds[r * C + c] = 0; }
                if (GRID[r].charAt(c) == 'E') { fe.add(r * C + c); de[r * C + c] = 0; }
            }
        while (!fs.isEmpty() && !fe.isEmpty()) {
            if (fs.size() <= fe.size()) fs = expand(fs, ds, de);
            else fe = expand(fe, de, ds);
            if (bestLen >= 0) break;
        }
        int visited = 0;
        for (int i = 0; i < R * C; i++) visited += (ds[i] >= 0 ? 1 : 0) + (de[i] >= 0 ? 1 : 0);
        System.out.println("path length = " + bestLen + "\nmeet at (" + bestCell / C + ", " + bestCell % C + ")\nvisited cells = " + visited);
    }
}
