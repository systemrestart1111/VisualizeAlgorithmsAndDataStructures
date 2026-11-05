public class MazeDFS {
    static char[][] grid;
    static int R, C;
    static boolean[][] seen;
    static int[] DR = {0, 1, 0, -1}, DC = {1, 0, -1, 0}; // 右、下、左、上

    // 往四個方向深入；走到死路就退回上一格換方向（回溯），到達 E 時整條路徑都還在遞迴堆疊上
    static boolean dfs(int r, int c) {
        if (grid[r][c] == 'E') return true;
        seen[r][c] = true;
        for (int d = 0; d < 4; d++) {
            int nr = r + DR[d], nc = c + DC[d];
            if (nr < 0 || nr >= R || nc < 0 || nc >= C || grid[nr][nc] == '#' || seen[nr][nc]) continue;
            if (grid[nr][nc] == '.') grid[nr][nc] = '*';
            if (dfs(nr, nc)) return true;
            if (grid[nr][nc] == '*') grid[nr][nc] = '.';
        }
        return false;
    }

    public static void main(String[] args) {
        String[] maze = {"S.#.......#.....", ".##.#####.#.###.", "....#...#...#...", ".####.#.#####.#.", "......#.......#.",
                         "#######.#####.#.", "......#.#.....#.", ".####.#.#.#####.", ".#....#...#....E"};
        R = maze.length;
        C = maze[0].length();
        grid = new char[R][];
        for (int r = 0; r < R; r++) grid[r] = maze[r].toCharArray();
        seen = new boolean[R][C];
        boolean found = dfs(0, 0);
        int len = 1;
        for (char[] row : grid) for (char ch : row) if (ch == '*') len++;
        System.out.println("found: " + (found ? "True" : "False") + " path length = " + len);
        for (char[] row : grid) System.out.println(new String(row));
    }
}
