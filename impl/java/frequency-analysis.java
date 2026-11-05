import java.util.*;

public class FrequencyAnalysis {
    static final double[] EN = {8.17, 1.49, 2.78, 4.25, 12.7, 2.23, 2.02, 6.09, 6.97, 0.15, 0.77, 4.03, 2.41, 6.75, 7.51, 1.93, 0.1, 5.99, 6.33, 9.06, 2.76, 0.98, 2.36, 0.15, 1.97, 0.07};

    public static void main(String[] args) {
        String cipher = "WKH TXLFN EURZQ IRA MXPSV RYHU WKH ODCB GRJ. IUHTXHQFB DQDOBVLV LV D FODVVLF ZDB WR EUHDN VXEVWLWXWLRQ FLSKHUV";
        int[] cnt = new int[26];
        int n = 0;
        for (char c : cipher.toCharArray()) if (c >= 'A' && c <= 'Z') { cnt[c - 'A']++; n++; }
        StringBuilder sb = new StringBuilder("counts:");
        for (int i = 0; i < 26; i++) if (cnt[i] > 0) sb.append(' ').append((char) ('A' + i)).append(cnt[i]);
        System.out.println(sb);
        // 對每個位移計算卡方距離，越小越像英文
        double[] chi = new double[26];
        for (int k = 0; k < 26; k++)
            for (int c = 0; c < 26; c++) { double e = n * EN[c] / 100, d = cnt[(c + k) % 26] - e; chi[k] += d * d / e; }
        Integer[] order = new Integer[26];
        for (int i = 0; i < 26; i++) order[i] = i;
        Arrays.sort(order, Comparator.comparingDouble(k -> chi[k]));
        for (int i = 0; i < 3; i++) System.out.printf("shift %d: chi2 = %.2f%n", order[i], chi[order[i]]);
        int best = order[0];
        StringBuilder plain = new StringBuilder();
        for (char c : cipher.toCharArray()) plain.append(c >= 'A' && c <= 'Z' ? (char) ('A' + (c - 'A' - best + 26) % 26) : c);
        System.out.println("plain: " + plain);
    }
}
