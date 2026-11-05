import java.util.ArrayList;
import java.util.List;

public class MazeGeneration {
    static final int ROWS = 8, COLS = 12;
    static long state = 42;

    // Park–Miller 亂數產生器：五種語言用同一個公式，因此會產生同一個迷宮
    static int randK(int k) {
        state = state * 48271 % 2147483647;
        return (int) (state % k);
    }

    public static void main(String[] args) {
        // 迷宮格子 (r, c) 位於字元圖的 (2r+1, 2c+1)；一開始全是牆
        char[][] grid = new char[2 * ROWS + 1][2 * COLS + 1];
        for (char[] row : grid) java.util.Arrays.fill(row, '#');
        boolean[][] visited = new boolean[ROWS][COLS];
        int[] DR = {-1, 0, 1, 0}, DC = {0, 1, 0, -1}; // 上、右、下、左
        // 遞迴回溯法（用堆疊實作）：從目前格子隨機走向一個沒去過的鄰格並打通中間的牆；四周都去過就退回上一格
        List<int[]> st = new ArrayList<>();
        st.add(new int[] {0, 0});
        visited[0][0] = true;
        grid[1][1] = ' ';
        while (!st.isEmpty()) {
            int[] cur = st.get(st.size() - 1);
            int r = cur[0], c = cur[1];
            List<int[]> nbrs = new ArrayList<>();
            for (int d = 0; d < 4; d++) {
                int nr = r + DR[d], nc = c + DC[d];
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited[nr][nc]) nbrs.add(new int[] {nr, nc});
            }
            if (nbrs.isEmpty()) { st.remove(st.size() - 1); continue; }
            int[] nxt = nbrs.get(randK(nbrs.size()));
            grid[r + nxt[0] + 1][c + nxt[1] + 1] = ' '; // 兩格中間的牆
            grid[2 * nxt[0] + 1][2 * nxt[1] + 1] = ' ';
            visited[nxt[0]][nxt[1]] = true;
            st.add(nxt);
        }
        for (char[] row : grid) System.out.println(new String(row));
    }
}
