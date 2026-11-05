import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Deque;
import java.util.List;

public class AhoCorasick {
    public static void main(String[] args) {
        String[] patterns = {"he", "she", "his", "hers"};
        String text = "ushershishe";
        List<int[]> child = new ArrayList<>();
        List<Integer> fail = new ArrayList<>(), out = new ArrayList<>(), dictLink = new ArrayList<>();
        int[] root = new int[26];
        Arrays.fill(root, -1);
        child.add(root); fail.add(0); out.add(-1); dictLink.add(0);
        // 1. 把所有樣式插入字典樹
        for (int idx = 0; idx < patterns.length; idx++) {
            int u = 0;
            for (char ch : patterns[idx].toCharArray()) {
                int c = ch - 'a';
                if (child.get(u)[c] < 0) {
                    int[] row = new int[26];
                    Arrays.fill(row, -1);
                    child.get(u)[c] = child.size();
                    child.add(row); fail.add(0); out.add(-1); dictLink.add(0);
                }
                u = child.get(u)[c];
            }
            out.set(u, idx);
        }
        // 2. BFS 建立失配指標：fail[v] = v 所代表字串的最長「也在字典樹中」的真後綴
        Deque<Integer> q = new ArrayDeque<>();
        for (int c = 0; c < 26; c++) if (root[c] >= 0) q.add(root[c]);
        while (!q.isEmpty()) {
            int u = q.poll();
            for (int c = 0; c < 26; c++) {
                int v = child.get(u)[c];
                if (v < 0) continue;
                int f = fail.get(u);
                while (f != 0 && child.get(f)[c] < 0) f = fail.get(f);
                int fv = child.get(f)[c] >= 0 && child.get(f)[c] != v ? child.get(f)[c] : 0;
                fail.set(v, fv);
                dictLink.set(v, out.get(fv) >= 0 ? fv : dictLink.get(fv)); // 沿失配鏈第一個樣式終點
                q.add(v);
            }
        }
        // 3. 掃描文字一次：失配就沿 fail 退回，每到一個節點就輸出它及其輸出鏈上的所有樣式
        int u = 0;
        for (int i = 0; i < text.length(); i++) {
            int c = text.charAt(i) - 'a';
            while (u != 0 && child.get(u)[c] < 0) u = fail.get(u);
            u = child.get(u)[c] >= 0 ? child.get(u)[c] : 0;
            for (int x = out.get(u) >= 0 ? u : dictLink.get(u); x != 0; x = dictLink.get(x)) {
                String p = patterns[out.get(x)];
                System.out.println("pos " + (i - p.length() + 1) + ": " + p);
            }
        }
    }
}
