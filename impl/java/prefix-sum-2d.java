public class PrefixSum2d {
    public static void main(String[] args) {
        int[][] a = {{3, 0, 1, 4, 2}, {5, 6, 3, 2, 1}, {1, 2, 0, 1, 5}, {4, 1, 0, 1, 7}, {1, 0, 3, 0, 5}};
        int R = a.length, C = a[0].length;
        // P[i][j] = 左上角 (0,0) 到 (i-1, j-1) 的總和
        int[][] P = new int[R + 1][C + 1];
        for (int i = 1; i <= R; i++)
            for (int j = 1; j <= C; j++) P[i][j] = a[i - 1][j - 1] + P[i - 1][j] + P[i][j - 1] - P[i - 1][j - 1];
        int[][] qs = {{1, 1, 3, 3}, {0, 0, 4, 4}, {2, 2, 2, 2}, {0, 3, 4, 4}};
        for (int[] q : qs) {
            int brute = 0;
            for (int i = q[0]; i <= q[2]; i++) for (int j = q[1]; j <= q[3]; j++) brute += a[i][j];
            int s = P[q[2] + 1][q[3] + 1] - P[q[0]][q[3] + 1] - P[q[2] + 1][q[1]] + P[q[0]][q[1]];
            System.out.println("sum(" + q[0] + ", " + q[1] + ", " + q[2] + ", " + q[3] + ") = " + s + " (brute " + brute + ")");
        }
    }
}
