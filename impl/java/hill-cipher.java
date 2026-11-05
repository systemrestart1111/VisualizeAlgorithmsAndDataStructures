public class HillCipher {
    static int m26(int x) { return Math.floorMod(x, 26); }

    // 2×2 金鑰在 mod 26 的反矩陣；det 與 26 不互質時回傳 null
    static int[][] inverseKey(int[][] K) {
        int d = m26(K[0][0] * K[1][1] - K[0][1] * K[1][0]), di = -1;
        for (int x = 1; x < 26; x++) if (d * x % 26 == 1) di = x;
        if (di < 0) return null;
        return new int[][]{{m26(K[1][1] * di), m26(-K[0][1] * di)}, {m26(-K[1][0] * di), m26(K[0][0] * di)}};
    }
    static String hill(String text, int[][] K) {
        String t = text.toUpperCase().replaceAll("[^A-Z]", "");
        if (t.length() % 2 == 1) t += "X";
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < t.length(); i += 2) {
            int a = t.charAt(i) - 'A', b = t.charAt(i + 1) - 'A';
            for (int r = 0; r < 2; r++) out.append((char) ('A' + m26(K[r][0] * a + K[r][1] * b)));
        }
        return out.toString();
    }

    public static void main(String[] args) {
        int[][] K = {{3, 3}, {2, 5}}, Ki = inverseKey(K);
        System.out.println("K^-1 = [[" + Ki[0][0] + ", " + Ki[0][1] + "], [" + Ki[1][0] + ", " + Ki[1][1] + "]]");
        String c = hill("HELP ME", K);
        System.out.println("cipher: " + c);
        System.out.println("plain : " + hill(c, Ki));
        System.out.println("key [[2,4],[6,8]] invertible: " + (inverseKey(new int[][]{{2, 4}, {6, 8}}) != null ? "True" : "False"));
    }
}
