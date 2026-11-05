import java.util.ArrayList;
import java.util.List;

public class NQueens {
    static final int N = 6;
    static boolean[] cols = new boolean[N], d1 = new boolean[2 * N], d2 = new boolean[2 * N];
    static int[] pos = new int[N];
    static List<int[]> sols = new ArrayList<>();

    // 逐列放皇后；用三個陣列記錄被佔用的欄與兩條對角線，衝突就換下一欄（回溯）
    static void bt(int r) {
        if (r == N) { sols.add(pos.clone()); return; }
        for (int c = 0; c < N; c++) {
            if (cols[c] || d1[r - c + N] || d2[r + c]) continue;
            cols[c] = d1[r - c + N] = d2[r + c] = true;
            pos[r] = c;
            bt(r + 1);
            cols[c] = d1[r - c + N] = d2[r + c] = false;
        }
    }

    public static void main(String[] args) {
        bt(0);
        System.out.println("solutions = " + sols.size());
        for (int r = 0; r < N; r++) {
            StringBuilder sb = new StringBuilder();
            for (int c = 0; c < N; c++) sb.append(c > 0 ? " " : "").append(c == sols.get(0)[r] ? 'Q' : '.');
            System.out.println(sb);
        }
    }
}
