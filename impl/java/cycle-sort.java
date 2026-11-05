public class CycleSort {
    static int posOf(int[] a, int start, int item) { int p = start; for (int i = start + 1; i < a.length; i++) if (a[i] < item) p++; return p; }

    // 每個元素直接寫到最終位置；跳過重複值避免無窮迴圈。回傳寫入次數
    static int cycleSort(int[] a) {
        int writes = 0;
        for (int start = 0; start < a.length - 1; start++) {
            int item = a[start], pos = posOf(a, start, item), t;
            if (pos == start) continue;
            while (item == a[pos]) pos++;
            t = a[pos]; a[pos] = item; item = t; writes++;
            while (pos != start) {
                pos = posOf(a, start, item);
                while (pos != start && item == a[pos]) pos++;
                if (pos == start) { a[start] = item; writes++; break; }
                t = a[pos]; a[pos] = item; item = t; writes++;
            }
        }
        return writes;
    }
    static String show(int[] a) { StringBuilder sb = new StringBuilder(); for (int x : a) sb.append(' ').append(x); return sb.toString(); }

    public static void main(String[] args) {
        int[] a = {20, 40, 50, 10, 30, 40, 20, 60, 10}, b = {3, 3, 3, 1};
        int w = cycleSort(a);
        System.out.println("sorted:" + show(a));
        System.out.println("writes: " + w);
        String before = show(b);
        cycleSort(b);
        System.out.println("dups:" + before + " ->" + show(b));
    }
}
