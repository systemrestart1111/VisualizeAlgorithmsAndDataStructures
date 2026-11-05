public class LongestPalindromicSubsequence {
    // L[i][j]：兩端相同 → L[i+1][j−1] + 2；不同 → max(L[i+1][j], L[i][j−1])
    static void lps(String s) {
        int n = s.length();
        int[][] L = new int[n][n];
        for (int i = 0; i < n; i++) L[i][i] = 1;
        for (int len = 2; len <= n; len++)
            for (int i = 0; i + len - 1 < n; i++) {
                int j = i + len - 1;
                L[i][j] = s.charAt(i) == s.charAt(j) ? (len > 2 ? L[i + 1][j - 1] : 0) + 2 : Math.max(L[i + 1][j], L[i][j - 1]);
            }
        StringBuilder left = new StringBuilder(), right = new StringBuilder();
        for (int i = 0, j = n - 1; i <= j;) {
            if (i == j) { left.append(s.charAt(i)); break; }
            if (s.charAt(i) == s.charAt(j)) { left.append(s.charAt(i)); right.insert(0, s.charAt(j)); i++; j--; }
            else if (L[i + 1][j] >= L[i][j - 1]) i++;
            else j--;
        }
        System.out.println(s + ": " + L[0][n - 1] + " (" + left + right + ")");
    }

    public static void main(String[] args) {
        for (String s : new String[]{"BBABCBCAB", "CHARACTER", "AGBDBA", "X"}) lps(s);
    }
}
