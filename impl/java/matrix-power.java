public class MatrixPower {
    static long[][] mul(long[][] A, long[][] B) {
        long[][] C = new long[2][2];
        for (int i = 0; i < 2; i++)
            for (int j = 0; j < 2; j++) C[i][j] = A[i][0] * B[0][j] + A[i][1] * B[1][j];
        return C;
    }

    // 與快速冪相同，只是把「數字相乘」換成「矩陣相乘」
    static long[][] matPow(long[][] M, long n) {
        long[][] R = {{1, 0}, {0, 1}};
        for (; n > 0; n >>= 1) {
            if ((n & 1) == 1) R = mul(R, M);
            M = mul(M, M);
        }
        return R;
    }

    // [[1,1],[1,0]]^n = [[F(n+1), F(n)], [F(n), F(n-1)]]，O(log n) 求出第 n 項費氏數
    public static void main(String[] args) {
        int n = 25;
        long[][] R = matPow(new long[][] {{1, 1}, {1, 0}}, n);
        System.out.println("M^" + n + " = [[" + R[0][0] + ", " + R[0][1] + "], [" + R[1][0] + ", " + R[1][1] + "]]");
        System.out.println("F(" + n + ") = " + R[0][1]);
    }
}
