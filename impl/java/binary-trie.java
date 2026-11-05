import java.util.*;

public class BinaryTrie {
    static final int W = 5;
    static List<int[]> ch = new ArrayList<>(List.of(new int[]{-1, -1}));
    static List<Integer> cnt = new ArrayList<>(List.of(0));

    // 固定 W 位元，由高位到低位；每個節點記錄經過的數字個數，支援重複與刪除
    static void add(int x, int d) {
        int u = 0;
        cnt.set(0, cnt.get(0) + d);
        for (int i = W - 1; i >= 0; i--) {
            int b = (x >> i) & 1;
            if (ch.get(u)[b] < 0) { ch.get(u)[b] = cnt.size(); ch.add(new int[]{-1, -1}); cnt.add(0); }
            u = ch.get(u)[b];
            cnt.set(u, cnt.get(u) + d);
        }
    }
    // 每一位盡量走與 x 相反的分支
    static int maxXor(int x) {
        int u = 0, y = 0;
        for (int i = W - 1; i >= 0; i--) {
            int b = (x >> i) & 1, v = ch.get(u)[1 - b];
            if (v >= 0 && cnt.get(v) > 0) { u = v; y |= (1 - b) << i; }
            else { u = ch.get(u)[b]; y |= b << i; }
        }
        return y;
    }

    public static void main(String[] args) {
        for (int x : new int[]{3, 10, 5, 25, 2, 8}) add(x, 1);
        for (int x : new int[]{5, 25, 7, 31, 0}) { int y = maxXor(x); System.out.printf("max xor with %2d: %2d -> %d%n", x, y, x ^ y); }
        add(25, -1);
        int y = maxXor(5);
        System.out.println("after delete 25, max xor with 5: " + y + " -> " + (5 ^ y));
    }
}
