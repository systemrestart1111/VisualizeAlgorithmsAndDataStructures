import java.util.*;

public class RailFenceCipher {
    // 讀出順序：依（所在軌道, 原位置）排序
    static Integer[] orderOf(int n, int rails) {
        int[] row = new int[n];
        for (int i = 0, r = 0, d = 1; i < n; i++) {
            row[i] = r;
            if (rails > 1) { if (r == 0) d = 1; else if (r == rails - 1) d = -1; r += d; }
        }
        Integer[] order = new Integer[n];
        for (int i = 0; i < n; i++) order[i] = i;
        Arrays.sort(order, Comparator.comparingInt((Integer i) -> row[i]).thenComparingInt(i -> i));
        return order;
    }
    static String encrypt(String t, int rails) {
        StringBuilder sb = new StringBuilder();
        for (int i : orderOf(t.length(), rails)) sb.append(t.charAt(i));
        return sb.toString();
    }
    static String decrypt(String c, int rails) {
        char[] out = new char[c.length()];
        Integer[] o = orderOf(c.length(), rails);
        for (int k = 0; k < c.length(); k++) out[o[k]] = c.charAt(k);
        return new String(out);
    }

    public static void main(String[] args) {
        String c = encrypt("WEAREDISCOVERED", 3);
        System.out.println("cipher: " + c);
        System.out.println("plain : " + decrypt(c, 3));
        System.out.println("1 rail: " + encrypt("HELLO", 1));
        System.out.println("short : " + encrypt("AB", 5) + " " + decrypt(encrypt("AB", 5), 5));
    }
}
