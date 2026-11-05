import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class KnightsTour {
    static final int N = 6;
    static int[][] board = new int[N][N];
    static int backtracks = 0;
    static int[] DR = {2, 1, -1, -2, -2, -1, 1, 2}, DC = {1, 2, 2, 1, -1, -2, -2, -1};

    static boolean freeCell(int r, int c) { return r >= 0 && r < N && c >= 0 && c < N && board[r][c] == 0; }

    // 從 (r, c) 還能跳到幾個沒走過的格子
    static int onward(int r, int c) {
        int k = 0;
        for (int d = 0; d < 8; d++) if (freeCell(r + DR[d], c + DC[d])) k++;
        return k;
    }

    // Warnsdorff 規則：優先跳到「之後出路最少」的格子；仍走不通時回溯
    static boolean tour(int r, int c, int step) {
        board[r][c] = step;
        if (step == N * N) return true;
        List<int[]> cand = new ArrayList<>();
        for (int d = 0; d < 8; d++)
            if (freeCell(r + DR[d], c + DC[d])) cand.add(new int[] {r + DR[d], c + DC[d]});
        cand.sort(Comparator.comparingInt(p -> onward(p[0], p[1]))); // 穩定排序
        for (int[] p : cand)
            if (tour(p[0], p[1], step + 1)) return true;
        board[r][c] = 0;
        backtracks++;
        return false;
    }

    public static void main(String[] args) {
        boolean found = tour(0, 0, 1);
        System.out.println("found: " + (found ? "True" : "False") + " backtracks = " + backtracks);
        for (int[] row : board) {
            StringBuilder sb = new StringBuilder();
            for (int x : row) sb.append(String.format("%3d", x));
            System.out.println(sb);
        }
    }
}
