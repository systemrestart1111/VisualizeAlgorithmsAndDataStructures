import java.util.Arrays;

public class Horspool {
    // 只用「視窗最右端那個文字字元」決定移動量：shift[c] = 它在樣式（不含最後一字）中最後出現處到結尾的距離
    public static void main(String[] args) {
        String t = "JIM SAW ME IN A BARBERSHOP", p = "BARBER";
        int n = t.length(), m = p.length();
        int[] shift = new int[256];
        Arrays.fill(shift, m);
        for (int i = 0; i < m - 1; i++) shift[p.charAt(i)] = m - 1 - i;
        StringBuilder tries = new StringBuilder("alignments tried:"), matches = new StringBuilder("matches at:");
        for (int s = 0; s <= n - m; s += shift[t.charAt(s + m - 1)]) {
            tries.append(' ').append(s);
            int j = m - 1;
            while (j >= 0 && p.charAt(j) == t.charAt(s + j)) j--;
            if (j < 0) matches.append(' ').append(s);
        }
        System.out.println(tries + "\n" + matches);
    }
}
