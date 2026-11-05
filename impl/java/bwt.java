import java.util.*;

public class Bwt {
    // 加上終止符 $，排序所有循環旋轉，取最後一欄
    static String bwt(String s) {
        s += "$";
        String[] rots = new String[s.length()];
        for (int i = 0; i < s.length(); i++) rots[i] = s.substring(i) + s.substring(0, i);
        Arrays.sort(rots);
        StringBuilder L = new StringBuilder();
        for (String r : rots) L.append(r.charAt(r.length() - 1));
        return L.toString();
    }
    // LF 映射：L 中第 k 個 c 對應 F 中第 k 個 c；從 $ 所在列往回讀
    static String inverse(String L) {
        char[] F = L.toCharArray();
        Arrays.sort(F);
        Map<Character, Integer> first = new HashMap<>(), seen = new HashMap<>();
        for (int i = F.length - 1; i >= 0; i--) first.put(F[i], i);
        int[] LF = new int[L.length()];
        for (int i = 0; i < L.length(); i++) { char c = L.charAt(i); LF[i] = first.get(c) + seen.getOrDefault(c, 0); seen.merge(c, 1, Integer::sum); }
        int row = L.indexOf('$');
        StringBuilder out = new StringBuilder();
        for (int k = 0; k + 1 < L.length(); k++) { row = LF[row]; out.insert(0, L.charAt(row)); }
        return out.toString();
    }

    public static void main(String[] args) {
        for (String s : new String[]{"banana", "abracadabra", "mississippi", "aaaa"}) {
            String L = bwt(s);
            System.out.println(s + ": bwt " + L + ", inverse " + inverse(L));
        }
    }
}
