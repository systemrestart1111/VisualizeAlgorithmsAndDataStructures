import java.util.*;

public class MultiSourceBfs {
    public static void main(String[] args) {
        String[] G = {"S....#....", ".##..#.##.", "....#....S", ".#.....#..", ".#.##.....", "...#...S.."};
        int R = G.length, C = G[0].length(), best = 0;
        int[][] dist = new int[R][C];
        ArrayDeque<int[]> q = new ArrayDeque<>();
        // 所有起點同時入佇列、距離 0，第一次碰到某格時就是到最近起點的距離
        for (int i = 0; i < R; i++) for (int j = 0; j < C; j++) { dist[i][j] = -1; if (G[i].charAt(j) == 'S') { dist[i][j] = 0; q.add(new int[]{i, j}); } }
        int[][] D = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        while (!q.isEmpty()) {
            int[] c = q.poll();
            for (int[] d : D) {
                int a = c[0] + d[0], b = c[1] + d[1];
                if (a < 0 || b < 0 || a >= R || b >= C || G[a].charAt(b) == '#' || dist[a][b] >= 0) continue;
                dist[a][b] = dist[c[0]][c[1]] + 1;
                q.add(new int[]{a, b});
            }
        }
        for (int i = 0; i < R; i++) {
            StringBuilder sb = new StringBuilder();
            for (int j = 0; j < C; j++) {
                if (j > 0) sb.append(' ');
                sb.append(G[i].charAt(j) == '#' ? " #" : dist[i][j] < 0 ? " ." : String.format("%2d", dist[i][j]));
                best = Math.max(best, dist[i][j]);
            }
            System.out.println(sb);
        }
        System.out.println("farthest cell distance: " + best);
    }
}
