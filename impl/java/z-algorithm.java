public class ZAlgorithm {
    // z[i] = s 與 s[i:] 的最長共同前綴長度；利用目前最右的 Z-box [l, r) 避免重複比較，O(n)
    static int[] zFunction(String s) {
        int n = s.length();
        int[] z = new int[n];
        for (int i = 1, l = 0, r = 0; i < n; i++) {
            if (i < r) z[i] = Math.min(r - i, z[i - l]);
            while (i + z[i] < n && s.charAt(z[i]) == s.charAt(i + z[i])) z[i]++;
            if (i + z[i] > r) { l = i; r = i + z[i]; }
        }
        return z;
    }

    public static void main(String[] args) {
        String s = "aab$baabaaab";
        int[] z = zFunction(s);
        int m = s.indexOf('$'); // 把「樣式$文字」接起來，z[i] == len(樣式) 就是一次匹配
        StringBuilder a = new StringBuilder("z:"), b = new StringBuilder("pattern " + s.substring(0, m) + " found in text at:");
        for (int x : z) a.append(' ').append(x);
        for (int i = 0; i < s.length(); i++) if (z[i] == m) b.append(' ').append(i - m - 1);
        System.out.println(a + "\n" + b);
    }
}
