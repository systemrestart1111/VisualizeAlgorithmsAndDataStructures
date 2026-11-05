import java.util.Map;
import java.util.TreeMap;

public class ArithmeticCoding {
    static long ipow(long b, int e) { long r = 1; while (e-- > 0) r *= b; return r; }

    // num / total^k 的十進位表示（total = 5 時恰好是有限小數）
    static String dec(long num, int k, long total) {
        if (k == 0) return String.valueOf(num);
        long v = num * ipow(10, k) / ipow(total, k), p = ipow(10, k);
        return (v / p) + "." + String.format("%0" + k + "d", v % p);
    }

    // 依出現頻率把 [0, 1) 切給各符號；每編一個符號就把目前區間縮小到該符號負責的那一段
    // 區間以分數 low/denom、(low+width)/denom 表示，全程整數運算，沒有浮點誤差
    public static void main(String[] args) {
        String msg = "BACAB";
        int n = msg.length();
        long total = n, acc = 0;
        TreeMap<Character, Long> freq = new TreeMap<>(), cum = new TreeMap<>();
        for (char c : msg.toCharArray()) freq.merge(c, 1L, Long::sum);
        for (Map.Entry<Character, Long> e : freq.entrySet()) { cum.put(e.getKey(), acc); acc += e.getValue(); }
        StringBuilder sb = new StringBuilder("model:");
        for (char c : freq.keySet()) sb.append(' ').append(c).append(":[").append(cum.get(c)).append('/').append(total).append(',').append(cum.get(c) + freq.get(c)).append('/').append(total).append(')');
        System.out.println(sb);
        long low = 0, width = 1;
        for (int k = 1; k <= n; k++) {
            char ch = msg.charAt(k - 1);
            low = low * total + width * cum.get(ch);
            width *= freq.get(ch);
            System.out.println("after '" + ch + "': [" + dec(low, k, total) + ", " + dec(low + width, k, total) + ")");
        }
        System.out.println("code = " + dec(low, n, total) + " (= " + low + "/" + ipow(total, n) + ")");
        // 解碼：看 code 落在哪個符號的區段，再把它放大回 [0, 1)
        long num = low, den = ipow(total, n);
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < n; k++) {
            long scaled = num * total;
            char ch = 0;
            for (char c : freq.descendingKeySet()) if (scaled >= cum.get(c) * den) { ch = c; break; }
            out.append(ch);
            num = scaled - cum.get(ch) * den;
            den *= freq.get(ch);
        }
        System.out.println("decoded: " + out);
    }
}
