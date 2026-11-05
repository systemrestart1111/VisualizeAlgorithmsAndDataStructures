import java.util.*;

public class PalindromePartition {
    // isPal 預算回文區間；cut[j] = 0（整段回文）或 min(cut[i−1] + 1)
    static void solve(String s) {
        int n = s.length();
        if (n == 0) { System.out.println("'': 0 cuts "); return; }
        boolean[][] P = new boolean[n][n];
        for (int len = 1; len <= n; len++)
            for (int i = 0; i + len - 1 < n; i++) { int j = i + len - 1; P[i][j] = s.charAt(i) == s.charAt(j) && (len < 3 || P[i + 1][j - 1]); }
        int[] cut = new int[n], prev = new int[n];
        for (int j = 0; j < n; j++) {
            if (P[0][j]) { cut[j] = 0; prev[j] = 0; continue; }
            cut[j] = n;
            for (int i = 1; i <= j; i++) if (P[i][j] && cut[i - 1] + 1 < cut[j]) { cut[j] = cut[i - 1] + 1; prev[j] = i; }
        }
        LinkedList<String> parts = new LinkedList<>();
        for (int j = n - 1; j >= 0; j = prev[j] - 1) parts.addFirst(s.substring(prev[j], j + 1));
        System.out.println("'" + s + "': " + cut[n - 1] + " cuts " + String.join(" | ", parts));
    }

    public static void main(String[] args) {
        for (String s : new String[]{"aabbcbbdd", "aab", "racecar", "abcde", ""}) solve(s);
    }
}
