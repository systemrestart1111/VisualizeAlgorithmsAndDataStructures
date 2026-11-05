import java.util.Arrays;

public class DigitDP {
    static int[] digits;
    static long[][][] memo;

    // 數位 DP：由高位往低位填數字；tight 表示前面都和 N 相同（這一位不能超過 N 的對應位）
    static long go(int pos, int rest, int tight) {
        if (rest < 0) return 0;
        if (pos == digits.length) return rest == 0 ? 1 : 0;
        if (memo[pos][rest][tight] >= 0) return memo[pos][rest][tight];
        int top = tight == 1 ? digits[pos] : 9;
        long r = 0;
        for (int d = 0; d <= top; d++) r += go(pos + 1, rest - d, tight == 1 && d == top ? 1 : 0);
        return memo[pos][rest][tight] = r;
    }

    public static void main(String[] args) {
        int N = 345, S = 10;
        digits = String.valueOf(N).chars().map(c -> c - '0').toArray();
        memo = new long[digits.length][S + 1][2];
        for (long[][] a : memo) for (long[] b : a) Arrays.fill(b, -1);
        System.out.println("numbers in [0, " + N + "] with digit sum " + S + ": " + go(0, S, 1));
        int brute = 0;
        for (int x = 0; x <= N; x++) {
            int s = 0;
            for (int y = x; y > 0; y /= 10) s += y % 10;
            if (s == S) brute++;
        }
        System.out.println("brute force check: " + brute);
    }
}
