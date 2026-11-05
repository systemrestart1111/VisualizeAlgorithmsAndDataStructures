import java.util.*;

public class MedianFilter {
    static final int N = 16;

    public static void main(String[] args) {
        int[][] clean = new int[N][N], A = new int[N][N];
        long s = 7;
        for (int r = 0; r < N; r++)
            for (int c = 0; c < N; c++) {
                int v = 30;
                if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
                if ((r - 10.5) * (r - 10.5) + (c - 10.5) * (c - 10.5) <= 12.96) v = 140;
                if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
                clean[r][c] = v;
                s = s * 48271 % 2147483647;
                int t = (int) (s % 100);
                A[r][c] = t < 5 ? 0 : t < 10 ? 255 : v;
            }
        int noise = 0, bad = 0;
        for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { if (A[r][c] == 0 || A[r][c] == 255) noise++; if (Math.abs(A[r][c] - clean[r][c]) > 40) bad++; }
        System.out.println("input: " + noise + " impulse pixels, " + bad + " pixels off by > 40");
        for (int rad = 1; rad <= 2; rad++) {
            int k = 2 * rad + 1, mn = 0, mb = 0, ab = 0, sum = 0;
            for (int r = 0; r < N; r++)
                for (int c = 0; c < N; c++) {
                    // 每個像素換成視窗內的中位數（邊界複製）；對照平均濾波
                    int[] w = new int[k * k];
                    int n = 0;
                    double mean = 0;
                    for (int i = -rad; i <= rad; i++) for (int j = -rad; j <= rad; j++) { w[n] = A[Math.min(N - 1, Math.max(0, r + i))][Math.min(N - 1, Math.max(0, c + j))]; mean += w[n]; n++; }
                    Arrays.sort(w);
                    int m = w[n / 2];
                    mean /= n;
                    sum += m;
                    if (m == 0 || m == 255) mn++;
                    if (Math.abs(m - clean[r][c]) > 40) mb++;
                    if (Math.abs(mean - clean[r][c]) > 40) ab++;
                }
            System.out.println(k + "x" + k + ": median leaves " + mn + " impulses, " + mb + " off by > 40 (sum " + sum + "); mean filter " + ab + " off by > 40");
        }
    }
}
