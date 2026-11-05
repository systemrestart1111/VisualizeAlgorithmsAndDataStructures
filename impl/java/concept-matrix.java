import java.util.*;

public class ConceptMatrix {
    static int[][] matmul(int[][] A, int[][] B) {
        int[][] C = new int[A.length][B[0].length];
        for (int i = 0; i < A.length; i++)
            for (int j = 0; j < B[0].length; j++)
                for (int k = 0; k < B.length; k++) C[i][j] += A[i][k] * B[k][j];
        return C;
    }
    static int[][] transpose(int[][] A) {
        int[][] T = new int[A[0].length][A.length];
        for (int i = 0; i < A.length; i++) for (int j = 0; j < A[0].length; j++) T[j][i] = A[i][j];
        return T;
    }
    static int det(int[][] A) {
        int n = A.length;
        if (n == 1) return A[0][0];
        int s = 0;
        for (int j = 0; j < n; j++) {
            int[][] sub = new int[n - 1][n - 1];
            for (int r = 1; r < n; r++) for (int k = 0, c = 0; k < n; k++) if (k != j) sub[r - 1][c++] = A[r][k];
            s += (j % 2 == 1 ? -1 : 1) * A[0][j] * det(sub);
        }
        return s;
    }

    public static void main(String[] args) {
        int[][] A = {{1, 2}, {3, 4}}, B = {{5, 6}, {7, 8}};
        System.out.println("AB = " + Arrays.deepToString(matmul(A, B)));
        System.out.println("BA = " + Arrays.deepToString(matmul(B, A)));
        System.out.println("A^T = " + Arrays.deepToString(transpose(A)));
        System.out.println("det(A) = " + det(A));
        System.out.println("det([[2,0,1],[1,3,2],[1,1,1]]) = " + det(new int[][]{{2, 0, 1}, {1, 3, 2}, {1, 1, 1}}));
    }
}
