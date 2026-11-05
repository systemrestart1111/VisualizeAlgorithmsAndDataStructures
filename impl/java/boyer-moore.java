import java.util.Arrays;

public class BoyerMoore {
    // 好後綴規則：已比對成功的後綴，在樣式中前一次出現的位置（或與前綴重疊的部分）決定可安全移動的距離
    static int[] goodSuffixTable(String p) {
        int m = p.length(), i = m, j = m + 1;
        int[] shift = new int[m + 1], border = new int[m + 1];
        border[i] = j;
        while (i > 0) {
            while (j <= m && p.charAt(i - 1) != p.charAt(j - 1)) {
                if (shift[j] == 0) shift[j] = j - i;
                j = border[j];
            }
            border[--i] = --j;
        }
        j = border[0];
        for (i = 0; i <= m; i++) {
            if (shift[i] == 0) shift[i] = j;
            if (i == j) j = border[j];
        }
        return shift;
    }

    // 由右往左比較；失配時取「壞字元規則」與「好後綴規則」中移得較遠的那個
    public static void main(String[] args) {
        String t = "HERE IS A SIMPLE EXAMPLE", p = "EXAMPLE";
        int n = t.length(), m = p.length();
        int[] last = new int[256], gs = goodSuffixTable(p);
        Arrays.fill(last, -1);
        for (int i = 0; i < m; i++) last[p.charAt(i)] = i; // 壞字元：該字元在樣式中最後出現的位置
        StringBuilder tries = new StringBuilder("alignments tried:"), matches = new StringBuilder("matches at:");
        for (int s = 0; s <= n - m;) {
            tries.append(' ').append(s);
            int j = m - 1;
            while (j >= 0 && p.charAt(j) == t.charAt(s + j)) j--;
            if (j < 0) { matches.append(' ').append(s); s += gs[0]; }
            else s += Math.max(gs[j + 1], j - last[t.charAt(s + j)]);
        }
        System.out.println(tries + "\n" + matches);
    }
}
