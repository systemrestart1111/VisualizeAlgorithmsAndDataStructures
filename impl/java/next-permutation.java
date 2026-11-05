public class NextPermutation {
    // 找轉折點 i、從右邊找比 a[i] 大的最右元素交換，再反轉尾段；已是最大排列時回到最小
    static void nextPerm(int[] a) {
        int i = a.length - 2, t;
        while (i >= 0 && a[i] >= a[i + 1]) i--;
        if (i >= 0) {
            int j = a.length - 1;
            while (a[j] <= a[i]) j--;
            t = a[i]; a[i] = a[j]; a[j] = t;
        }
        for (int x = i + 1, y = a.length - 1; x < y; x++, y--) { t = a[x]; a[x] = a[y]; a[y] = t; }
    }
    static String show(int[] a) { StringBuilder sb = new StringBuilder(); for (int i = 0; i < a.length; i++) sb.append(i > 0 ? " " : "").append(a[i]); return sb.toString(); }

    public static void main(String[] args) {
        int[] a = {1, 3, 5, 4, 2}, w = {3, 2, 1}, d = {1, 1, 2};
        for (int k = 0; k < 3; k++) { nextPerm(a); System.out.println(show(a)); }
        nextPerm(w);
        System.out.println("wrap: " + show(w));
        for (int k = 0; k < 3; k++) { nextPerm(d); System.out.println("dup: " + show(d)); }
    }
}
