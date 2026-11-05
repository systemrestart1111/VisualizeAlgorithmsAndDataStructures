import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class RollingHash {
    // 前綴雜湊：h[i] = s[0..i) 的多項式雜湊；任意子字串 s[l..r) 的雜湊 = h[r] - h[l]·B^(r-l)，O(1) 取得
    public static void main(String[] args) {
        String s = "banana_bandana";
        long B = 131, M = 1000003;
        int n = s.length(), L = 3;
        long[] h = new long[n + 1], pw = new long[n + 1];
        pw[0] = 1;
        for (int i = 0; i < n; i++) {
            h[i + 1] = (h[i] * B + s.charAt(i)) % M;
            pw[i + 1] = pw[i] * B % M;
        }
        Map<Long, List<Integer>> groups = new LinkedHashMap<>(); // 雜湊值 -> 出現位置（依第一次出現的順序）
        for (int i = 0; i + L <= n; i++) {
            long v = Math.floorMod(h[i + L] - h[i] * pw[L], M);
            groups.computeIfAbsent(v, k -> new ArrayList<>()).add(i);
        }
        System.out.println("substrings of length " + L + " appearing more than once:");
        for (Map.Entry<Long, List<Integer>> e : groups.entrySet()) {
            List<Integer> pos = e.getValue();
            String first = s.substring(pos.get(0), pos.get(0) + L);
            boolean same = pos.stream().allMatch(p -> s.substring(p, p + L).equals(first)); // 再確認字串真的相同
            if (pos.size() > 1 && same) {
                StringBuilder sb = new StringBuilder("  '" + first + "' hash=" + e.getKey() + " at");
                for (int p : pos) sb.append(' ').append(p);
                System.out.println(sb);
            }
        }
    }
}
