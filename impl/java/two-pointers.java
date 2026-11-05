public class TwoPointers {
    // 已排序陣列：和太小移左指標、太大移右指標；找不到回傳 null
    static int[] twoSumSorted(int[] a, int t) {
        int l = 0, r = a.length - 1;
        while (l < r) {
            int s = a[l] + a[r];
            if (s == t) return new int[]{l, r};
            if (s < t) l++; else r--;
        }
        return null;
    }

    public static void main(String[] args) {
        int[] a = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
        for (int t : new int[]{61, 100, 4, 163}) {
            boolean brute = false;
            for (int i = 0; i < a.length; i++) for (int j = i + 1; j < a.length; j++) if (a[i] + a[j] == t) brute = true;
            int[] p = twoSumSorted(a, t);
            String res = p == null ? "none" : "a[" + p[0] + "] + a[" + p[1] + "] = " + a[p[0]] + " + " + a[p[1]];
            System.out.println("t = " + t + ": " + res + " | brute: " + (brute ? "True" : "False"));
        }
    }
}
