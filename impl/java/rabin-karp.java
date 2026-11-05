public class RabinKarp {
    // 比較雜湊值取代逐字比較；視窗右移一格時用 O(1) 更新雜湊（滾動雜湊）。雜湊相同時仍需確認，避免碰撞
    public static void main(String[] args) {
        String t = "31415926535897932384626", p = "26";
        int n = t.length(), m = p.length(), q = 13, d = 256, h = 1, hp = 0, ht = 0;
        for (int i = 0; i < m - 1; i++) h = h * d % q; // 最高位的權重
        for (int i = 0; i < m; i++) {
            hp = (hp * d + p.charAt(i)) % q;
            ht = (ht * d + t.charAt(i)) % q;
        }
        StringBuilder a = new StringBuilder("matches at:"), b = new StringBuilder("spurious hits (hash collision):");
        for (int s = 0; s + m <= n; s++) {
            if (hp == ht) (t.startsWith(p, s) ? a : b).append(' ').append(s);
            if (s < n - m) ht = Math.floorMod((ht - t.charAt(s) * h) * d + t.charAt(s + m), q);
        }
        System.out.println(a + "\n" + b);
    }
}
