import java.util.*;

public class Morphology {
    static final int N = 16;

    static int[][] blobs() {
        int[][] a = new int[N][N];
        for (int r = 0; r < N; r++)
            for (int c = 0; c < N; c++)
                a[r][c] = (r - 5.5) * (r - 5.5) + (c - 5) * (c - 5) <= 16 || (r - 9) * (r - 9) + (c - 10.5) * (c - 10.5) <= 16 || (r - 13) * (r - 13) + (c - 2.5) * (c - 2.5) <= 3.5 ? 1 : 0;
        return a;
    }
    static int[][] noisyBin() {
        int[][] a = blobs();
        long s = 5;
        for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { s = s * 48271 % 2147483647; if (s % 100 < 6) a[r][c] = 1 - a[r][c]; }
        return a;
    }
    // 侵蝕：蓋到的全為 1 才為 1；膨脹：蓋到任一為 1 就為 1；邊界外視為 0
    static int[][] morph(int[][] a, int[][] se, boolean erode) {
        int[][] out = new int[N][N];
        for (int r = 0; r < N; r++)
            for (int c = 0; c < N; c++) {
                boolean all = true, any = false;
                for (int[] d : se) {
                    int y = r + d[0], x = c + d[1];
                    boolean v = y >= 0 && y < N && x >= 0 && x < N && a[y][x] == 1;
                    all &= v; any |= v;
                }
                out[r][c] = (erode ? all : any) ? 1 : 0;
            }
        return out;
    }
    static int count(int[][] a) { int s = 0; for (int[] row : a) for (int v : row) s += v; return s; }
    static int components(int[][] a) {
        int[][] seen = new int[N][N];
        int n = 0;
        int[][] D4 = {{-1, 0}, {0, -1}, {0, 1}, {1, 0}};
        for (int r = 0; r < N; r++)
            for (int c = 0; c < N; c++) {
                if (a[r][c] == 0 || seen[r][c] == 1) continue;
                n++;
                Deque<int[]> st = new ArrayDeque<>();
                st.push(new int[]{r, c});
                seen[r][c] = 1;
                while (!st.isEmpty()) {
                    int[] p = st.pop();
                    for (int[] d : D4) {
                        int y = p[0] + d[0], x = p[1] + d[1];
                        if (y >= 0 && y < N && x >= 0 && x < N && a[y][x] == 1 && seen[y][x] == 0) { seen[y][x] = 1; st.push(new int[]{y, x}); }
                    }
                }
            }
        return n;
    }

    public static void main(String[] args) {
        int[][] sq = {{0, 0}, {-1, -1}, {-1, 0}, {-1, 1}, {0, -1}, {0, 1}, {1, -1}, {1, 0}, {1, 1}}, cr = {{0, 0}, {-1, 0}, {0, -1}, {0, 1}, {1, 0}};
        String[] names = {"noisy blobs", "blobs"};
        int[][][] imgs = {noisyBin(), blobs()};
        for (int t = 0; t < 2; t++)
            for (int s = 0; s < 2; s++) {
                int[][] se = s == 0 ? sq : cr, A = imgs[t];
                int[][] er = morph(A, se, true), di = morph(A, se, false), op = morph(er, se, false), cl = morph(di, se, true);
                System.out.println(names[t] + ", " + (s == 0 ? "square" : "cross") + ": input " + count(A) + " (" + components(A) + " parts), erode " + count(er) + ", dilate " + count(di) + ", open " + count(op) + " (" + components(op) + " parts), close " + count(cl) + " (" + components(cl) + " parts)");
            }
    }
}
