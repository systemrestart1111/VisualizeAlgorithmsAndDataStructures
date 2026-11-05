import java.util.ArrayList;
import java.util.List;

public class IDAStar {
    static final int FOUND = -1, INF = 1_000_000;
    static char[][] grid = {"S..#....".toCharArray(), ".#.#.##.".toCharArray(), ".#...#..".toCharArray(), ".####.#.".toCharArray(), "......#E".toCharArray()};
    static int R = 5, C = 8, er = 4, ec = 7;
    static int[] DR = {0, 1, 0, -1}, DC = {1, 0, -1, 0};
    static List<Integer> path = new ArrayList<>();
    static boolean[][] inPath = new boolean[R][C];

    static int h(int r, int c) { return Math.abs(r - er) + Math.abs(c - ec); }

    // 深度優先，但 f = g + h 超過門檻就剪掉；回傳被剪掉的最小 f 作為下一輪門檻
    static int search(int g, int bound) {
        int u = path.get(path.size() - 1), r = u / C, c = u % C;
        int f = g + h(r, c);
        if (f > bound) return f;
        if (r == er && c == ec) return FOUND;
        int mn = INF;
        for (int d = 0; d < 4; d++) {
            int nr = r + DR[d], nc = c + DC[d];
            if (nr < 0 || nr >= R || nc < 0 || nc >= C || grid[nr][nc] == '#' || inPath[nr][nc]) continue;
            path.add(nr * C + nc);
            inPath[nr][nc] = true;
            int t = search(g + 1, bound);
            if (t == FOUND) return FOUND;
            mn = Math.min(mn, t);
            path.remove(path.size() - 1);
            inPath[nr][nc] = false;
        }
        return mn;
    }

    // 疊代加深：門檻從 h(S) 開始，每輪提高到上一輪被剪掉的最小 f，記憶體只需 O(路徑長)
    public static void main(String[] args) {
        int bound = h(0, 0);
        path.add(0);
        inPath[0][0] = true;
        StringBuilder sb = new StringBuilder("bounds:");
        for (;;) {
            sb.append(' ').append(bound);
            int t = search(0, bound);
            if (t == FOUND || t == INF) break;
            bound = t;
        }
        System.out.println(sb + "\npath length = " + (path.size() - 1));
        for (int i = 1; i + 1 < path.size(); i++) grid[path.get(i) / C][path.get(i) % C] = '*';
        for (char[] row : grid) System.out.println(new String(row));
    }
}
