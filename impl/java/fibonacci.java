import java.util.Arrays;

public class Fibonacci {
    static int calls = 0;
    static long[] memo = new long[100];

    // 單純遞迴：同一個子問題被重複計算，呼叫次數呈指數成長
    static long fibNaive(int n) {
        calls++;
        return n < 2 ? n : fibNaive(n - 1) + fibNaive(n - 2);
    }

    // 記憶化遞迴：每個子問題只算一次
    static long fibMemo(int n) {
        if (n < 2) return n;
        if (memo[n] >= 0) return memo[n];
        return memo[n] = fibMemo(n - 1) + fibMemo(n - 2);
    }

    public static void main(String[] args) {
        int n = 6;
        Arrays.fill(memo, -1);
        long a = fibNaive(n);
        System.out.println("naive fib(" + n + ") = " + a + ", calls = " + calls);
        System.out.println("memo  fib(" + n + ") = " + fibMemo(n));
        // 表格法：由小到大填表
        long[] t = new long[n + 1];
        if (n >= 1) t[1] = 1;
        for (int i = 2; i <= n; i++) t[i] = t[i - 1] + t[i - 2];
        StringBuilder sb = new StringBuilder("table:");
        for (long x : t) sb.append(' ').append(x);
        System.out.println(sb);
    }
}
