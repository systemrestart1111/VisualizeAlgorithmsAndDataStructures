import java.util.*;

public class PlayfairCipher {
    static String sq = "";
    static int[] pr = new int[26], pc = new int[26];

    // 關鍵字（J 視為 I，去重複）接上其餘字母，排成 5×5
    static void build(String key) {
        StringBuilder sb = new StringBuilder();
        for (char ch : (key + "ABCDEFGHIKLMNOPQRSTUVWXYZ").toUpperCase().toCharArray()) {
            if (ch < 'A' || ch > 'Z') continue;
            if (ch == 'J') ch = 'I';
            if (sb.indexOf("" + ch) < 0) { pr[ch - 'A'] = sb.length() / 5; pc[ch - 'A'] = sb.length() % 5; sb.append(ch); }
        }
        sq = sb.toString();
    }
    // 相同字母中間插 X（XX 則插 Q），奇數長度補 X（末字為 X 則補 Q）
    static List<String> pairsOf(String text) {
        String t = text.toUpperCase().replaceAll("[^A-Z]", "").replace('J', 'I');
        List<String> out = new ArrayList<>();
        for (int i = 0; i < t.length();) {
            char a = t.charAt(i), b;
            if (i + 1 >= t.length() || t.charAt(i + 1) == a) { b = a == 'X' ? 'Q' : 'X'; i += 1; }
            else { b = t.charAt(i + 1); i += 2; }
            out.add("" + a + b);
        }
        return out;
    }
    static List<String> playfair(List<String> ps, int d) {
        List<String> res = new ArrayList<>();
        for (String p : ps) {
            int a = p.charAt(0) - 'A', b = p.charAt(1) - 'A', ra = pr[a], ca = pc[a], rb = pr[b], cb = pc[b];
            if (ra == rb) res.add("" + sq.charAt(ra * 5 + (ca + d) % 5) + sq.charAt(rb * 5 + (cb + d) % 5));
            else if (ca == cb) res.add("" + sq.charAt((ra + d) % 5 * 5 + ca) + sq.charAt((rb + d) % 5 * 5 + cb));
            else res.add("" + sq.charAt(ra * 5 + cb) + sq.charAt(rb * 5 + ca));
        }
        return res;
    }

    public static void main(String[] args) {
        build("PLAYFAIR EXAMPLE");
        for (int r = 0; r < 5; r++) System.out.println(String.join(" ", sq.substring(r * 5, r * 5 + 5).split("")));
        List<String> c = playfair(pairsOf("HIDE THE GOLD IN THE TREE STUMP"), 1);
        System.out.println("cipher: " + String.join(" ", c));
        System.out.println("plain : " + String.join(" ", playfair(c, 4)));
    }
}
