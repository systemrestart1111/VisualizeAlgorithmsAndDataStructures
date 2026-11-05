import java.util.*;

public class ShiftAnd {
    // D 的第 j 位表示 pat[0..j] 目前是否匹配；D = ((D << 1) | 1) & B[c]
    static List<Integer> shiftAnd(String text, String pat) {
        int[] B = new int[128];
        int m = pat.length(), D = 0;
        for (int j = 0; j < m; j++) B[pat.charAt(j)] |= 1 << j;
        List<Integer> out = new ArrayList<>();
        for (int i = 0; i < text.length(); i++) {
            D = ((D << 1) | 1) & B[text.charAt(i)];
            if ((D & (1 << (m - 1))) != 0) out.add(i - m + 1);
        }
        return out;
    }

    public static void main(String[] args) {
        String[][] tests = {{"abracadabra cadabra", "abra"}, {"aaaaa", "aa"}, {"the cat sat on the mat", "at"}, {"abc", "abcd"}};
        for (String[] t : tests) {
            List<Integer> brute = new ArrayList<>();
            for (int i = 0; i + t[1].length() <= t[0].length(); i++) if (t[0].startsWith(t[1], i)) brute.add(i);
            System.out.println("'" + t[1] + "' in '" + t[0] + "': " + shiftAnd(t[0], t[1]) + " (brute " + brute + ")");
        }
    }
}
