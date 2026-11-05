import java.util.*;

public class MoveToFront {
    static final String ALPHABET = "abcdefghijklmnopqrstuvwxyz";

    // 輸出字元目前的位置，再把它移到最前面
    static List<Integer> encode(String s) {
        StringBuilder table = new StringBuilder(ALPHABET);
        List<Integer> out = new ArrayList<>();
        for (char c : s.toCharArray()) { int i = table.indexOf(String.valueOf(c)); out.add(i); table.deleteCharAt(i).insert(0, c); }
        return out;
    }
    static String decode(List<Integer> codes) {
        StringBuilder table = new StringBuilder(ALPHABET), out = new StringBuilder();
        for (int i : codes) { char c = table.charAt(i); out.append(c); table.deleteCharAt(i).insert(0, c); }
        return out.toString();
    }

    public static void main(String[] args) {
        for (String s : new String[]{"bananaaa", "aaabbbccc", "abcabcabc", "annb"}) {
            List<Integer> codes = encode(s);
            StringBuilder sb = new StringBuilder(s + ":");
            for (int c : codes) sb.append(' ').append(c);
            System.out.println(sb + " -> " + decode(codes));
        }
    }
}
