import java.util.*;

public class WordBreak {
    static String[] DICT = {"apple", "pen", "applepen", "pine", "pineapple", "cats", "dog", "sand", "and", "cat"};

    // dp[i] = 前 i 個字元的切法數；從每個可到達的 i 沿字典樹往後比對
    static void solve(String s) {
        List<Map<Character, Integer>> trie = new ArrayList<>(List.of(new HashMap<>()));
        List<Integer> endw = new ArrayList<>(List.of(-1));
        for (int w = 0; w < DICT.length; w++) {
            int u = 0;
            for (char ch : DICT[w].toCharArray()) {
                if (!trie.get(u).containsKey(ch)) { trie.get(u).put(ch, trie.size()); trie.add(new HashMap<>()); endw.add(-1); }
                u = trie.get(u).get(ch);
            }
            endw.set(u, w);
        }
        int n = s.length();
        long[] dp = new long[n + 1];
        int[] fromI = new int[n + 1], fromW = new int[n + 1];
        Arrays.fill(fromI, -1);
        dp[0] = 1;
        for (int i = 0; i < n; i++) {
            if (dp[i] == 0) continue;
            for (int u = 0, j = i; j < n && trie.get(u).containsKey(s.charAt(j));) {
                u = trie.get(u).get(s.charAt(j));
                j++;
                if (endw.get(u) >= 0) { dp[j] += dp[i]; if (fromI[j] < 0) { fromI[j] = i; fromW[j] = endw.get(u); } }
            }
        }
        StringBuilder sb = new StringBuilder("'" + s + "': " + dp[n] + " ways");
        if (dp[n] > 0 && n > 0) {
            LinkedList<String> parts = new LinkedList<>();
            for (int j = n; j > 0; j = fromI[j]) parts.addFirst(DICT[fromW[j]]);
            sb.append(", e.g. ").append(String.join(" ", parts));
        }
        System.out.println(sb);
    }

    public static void main(String[] args) {
        for (String s : new String[]{"pineapplepenapple", "catsanddog", "catsandog", ""}) solve(s);
    }
}
