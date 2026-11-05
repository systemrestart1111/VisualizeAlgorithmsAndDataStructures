public class SegmentTreeDemo {
    // 區間加值 + 區間求和；lazy[o] 記錄「整段都要加、但還沒往下推」的值，兩種操作都是 O(log n)
    static class SegmentTree {
        int n;
        long[] sum, lazy;

        SegmentTree(int[] a) {
            n = a.length;
            sum = new long[4 * n];
            lazy = new long[4 * n];
            build(1, 0, n - 1, a);
        }

        void build(int o, int l, int r, int[] a) {
            if (l == r) { sum[o] = a[l]; return; }
            int m = (l + r) / 2;
            build(2 * o, l, m, a);
            build(2 * o + 1, m + 1, r, a);
            sum[o] = sum[2 * o] + sum[2 * o + 1];
        }

        void apply(int o, int l, int r, long v) {
            sum[o] += v * (r - l + 1);
            lazy[o] += v;
        }

        void push(int o, int l, int r) {
            if (lazy[o] != 0) { // 要往下走之前，才把延遲的加值交給兩個子節點
                int m = (l + r) / 2;
                apply(2 * o, l, m, lazy[o]);
                apply(2 * o + 1, m + 1, r, lazy[o]);
                lazy[o] = 0;
            }
        }

        void add(int ql, int qr, long v) { add(1, 0, n - 1, ql, qr, v); }

        void add(int o, int l, int r, int ql, int qr, long v) {
            if (qr < l || r < ql) return;
            if (ql <= l && r <= qr) { apply(o, l, r, v); return; } // 整段被覆蓋：只更新這個節點並記下 lazy
            push(o, l, r);
            int m = (l + r) / 2;
            add(2 * o, l, m, ql, qr, v);
            add(2 * o + 1, m + 1, r, ql, qr, v);
            sum[o] = sum[2 * o] + sum[2 * o + 1];
        }

        long query(int ql, int qr) { return query(1, 0, n - 1, ql, qr); }

        long query(int o, int l, int r, int ql, int qr) {
            if (qr < l || r < ql) return 0;
            if (ql <= l && r <= qr) return sum[o];
            push(o, l, r);
            int m = (l + r) / 2;
            return query(2 * o, l, m, ql, qr) + query(2 * o + 1, m + 1, r, ql, qr);
        }
    }

    static void show(SegmentTree st) {
        StringBuilder sb = new StringBuilder("array: [");
        for (int i = 0; i < st.n; i++) sb.append(i > 0 ? " " : "").append(st.query(i, i));
        System.out.println(sb.append("]"));
    }

    public static void main(String[] args) {
        SegmentTree st = new SegmentTree(new int[] {5, 8, 6, 3, 2, 7, 2, 6});
        show(st);
        System.out.println("sum[2, 5] = " + st.query(2, 5));
        st.add(1, 4, 3); System.out.println("add +3 on [1, 4]");
        System.out.println("sum[0, 7] = " + st.query(0, 7));
        System.out.println("sum[3, 6] = " + st.query(3, 6));
        st.add(4, 7, -2); System.out.println("add -2 on [4, 7]");
        show(st);
        System.out.println("sum[0, 7] = " + st.query(0, 7));
    }
}
