public class FenwickDemo {
    // t[i] 負責區間 (i - lowbit(i), i]；更新與前綴和都只走 O(log n) 個位置（索引從 1 開始）
    static class Fenwick {
        int n;
        int[] t;

        Fenwick(int[] a) {
            n = a.length;
            t = new int[n + 1];
            for (int i = 1; i <= n; i++) add(i, a[i - 1]);
        }

        void add(int i, int v) {
            for (; i <= n; i += i & -i) t[i] += v; // 往上走到下一個也涵蓋 i 的位置
        }

        int prefix(int i) {
            int s = 0;
            for (; i > 0; i -= i & -i) s += t[i]; // 去掉最低位的 1
            return s;
        }

        int rangeSum(int l, int r) { return prefix(r) - prefix(l - 1); }
    }

    static void show(Fenwick f) {
        StringBuilder sb = new StringBuilder("t[1..12] =");
        for (int i = 1; i <= f.n; i++) sb.append(' ').append(f.t[i]);
        System.out.println(sb);
    }

    public static void main(String[] args) {
        Fenwick f = new Fenwick(new int[] {3, 2, -1, 6, 5, 4, -3, 3, 7, 2, 3, 1});
        show(f);
        System.out.println("prefix(7) = " + f.prefix(7));
        System.out.println("sum[3, 9] = " + f.rangeSum(3, 9));
        f.add(5, 4); System.out.println("add +4 at 5");
        System.out.println("prefix(7) = " + f.prefix(7));
        System.out.println("sum[3, 9] = " + f.rangeSum(3, 9));
        show(f);
    }
}
