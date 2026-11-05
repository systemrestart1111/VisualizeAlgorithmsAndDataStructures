public class KMP {
    // lps[i] = p[0..i] 最長的「相同前綴與後綴」長度（不含整個字串）
    static int[] prefixFunction(String p) {
        int[] lps = new int[p.length()];
        for (int i = 1, k = 0; i < p.length(); i++) {
            while (k > 0 && p.charAt(i) != p.charAt(k)) k = lps[k - 1];
            if (p.charAt(i) == p.charAt(k)) k++;
            lps[i] = k;
        }
        return lps;
    }

    // 失配時不回退文字指標，而是依 lps 把樣式滑到下一個可能的位置
    public static void main(String[] args) {
        String t = "ABABDABACDABABCABAB", p = "ABABCABAB";
        int[] lps = prefixFunction(p);
        StringBuilder a = new StringBuilder("lps:"), b = new StringBuilder("matches at:");
        for (int x : lps) a.append(' ').append(x);
        for (int i = 0, k = 0; i < t.length(); i++) {
            while (k > 0 && t.charAt(i) != p.charAt(k)) k = lps[k - 1];
            if (t.charAt(i) == p.charAt(k)) k++;
            if (k == p.length()) { b.append(' ').append(i - k + 1); k = lps[k - 1]; }
        }
        System.out.println(a + "\n" + b);
    }
}
