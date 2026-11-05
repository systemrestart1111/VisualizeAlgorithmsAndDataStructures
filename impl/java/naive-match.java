public class NaiveMatch {
    // 每個起點都從頭逐字比較；不相符就把樣式右移一格
    public static void main(String[] args) {
        String t = "AABAACAADAABAABA", p = "AABA";
        int n = t.length(), m = p.length(), comparisons = 0;
        StringBuilder sb = new StringBuilder("matches at:");
        for (int s = 0; s + m <= n; s++) {
            int j = 0;
            while (j < m) {
                comparisons++;
                if (t.charAt(s + j) != p.charAt(j)) break;
                j++;
            }
            if (j == m) sb.append(' ').append(s);
        }
        System.out.println(sb + "\ncomparisons = " + comparisons);
    }
}
