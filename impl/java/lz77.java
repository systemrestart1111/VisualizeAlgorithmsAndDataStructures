import java.util.ArrayList;
import java.util.List;

public class LZ77 {
    // 在前面 window 個字元的「搜尋視窗」中找最長匹配，輸出 (往回距離, 長度, 下一個字元)；匹配可延伸到尚未編碼的部分
    public static void main(String[] args) {
        String s = "abracadabrarray";
        int n = s.length(), window = 8;
        List<int[]> tokens = new ArrayList<>(); // {距離, 長度, 字元}
        for (int i = 0; i < n;) {
            int bestLen = 0, bestOff = 0;
            for (int off = 1; off <= Math.min(window, i); off++) {
                int len = 0;
                while (i + len < n - 1 && s.charAt(i - off + len) == s.charAt(i + len)) len++;
                if (len > bestLen) { bestLen = len; bestOff = off; }
            }
            tokens.add(new int[] {bestOff, bestLen, s.charAt(i + bestLen)});
            i += bestLen + 1;
        }
        StringBuilder sb = new StringBuilder("tokens:"), dec = new StringBuilder();
        for (int[] t : tokens) {
            sb.append(" (").append(t[0]).append(',').append(t[1]).append(',').append((char) t[2]).append(')');
            for (int r = 0; r < t[1]; r++) dec.append(dec.charAt(dec.length() - t[0]));
            dec.append((char) t[2]);
        }
        System.out.println(sb + "\ndecode ok: " + (dec.toString().equals(s) ? "True" : "False"));
    }
}
