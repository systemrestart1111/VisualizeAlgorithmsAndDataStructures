import java.util.Arrays;

public class Difference2d {
    public static void main(String[] args) {
        int R = 5, C = 6;
        int[][] ops = {{0, 0, 2, 2, 3}, {1, 2, 4, 5, 2}, {3, 0, 4, 1, -1}};
        int[][] D = new int[R + 1][C + 1], naive = new int[R][C], out = new int[R][C];
        for (int[] o : ops) {
            int r1 = o[0], c1 = o[1], r2 = o[2], c2 = o[3], v = o[4];
            // 只改四個角
            D[r1][c1] += v; D[r1][c2 + 1] -= v; D[r2 + 1][c1] -= v; D[r2 + 1][c2 + 1] += v;
            for (int i = r1; i <= r2; i++) for (int j = c1; j <= c2; j++) naive[i][j] += v;
        }
        // 二維前綴和還原
        for (int i = 0; i < R; i++) {
            StringBuilder sb = new StringBuilder();
            for (int j = 0; j < C; j++) {
                out[i][j] = D[i][j] + (i > 0 ? out[i - 1][j] : 0) + (j > 0 ? out[i][j - 1] : 0) - (i > 0 && j > 0 ? out[i - 1][j - 1] : 0);
                sb.append(j > 0 ? " " : "").append(String.format("%2d", out[i][j]));
            }
            System.out.println(sb);
        }
        System.out.println("matches naive: " + (Arrays.deepEquals(out, naive) ? "True" : "False"));
    }
}
