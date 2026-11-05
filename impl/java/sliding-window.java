public class SlidingWindow {
    // 固定長度 k：加入右邊新元素、減去左邊離開的元素；回傳 {最大和, 起點}
    static int[] maxWindowSum(int[] a, int k) {
        int s = 0;
        for (int i = 0; i < k; i++) s += a[i];
        int best = s, at = 0;
        for (int i = k; i < a.length; i++) { s += a[i] - a[i - k]; if (s > best) { best = s; at = i - k + 1; } }
        return new int[]{best, at};
    }
    // 可變視窗：只適用於元素皆為正；有非正數回傳 -1，不存在回傳 0
    static int minLenAtLeast(int[] a, int S) {
        for (int x : a) if (x <= 0) return -1;
        int l = 0, s = 0, best = a.length + 1;
        for (int r = 0; r < a.length; r++) {
            s += a[r];
            while (s >= S) { best = Math.min(best, r - l + 1); s -= a[l++]; }
        }
        return best > a.length ? 0 : best;
    }

    public static void main(String[] args) {
        int[] a = {4, 2, 12, 1, 7, 9, 3, 2, 8, 5};
        int[] p = maxWindowSum(a, 3);
        System.out.println("max sum of length 3: " + p[0] + " at " + p[1]);
        System.out.println("shortest with sum >= 18: " + minLenAtLeast(a, 18));
        System.out.println("shortest with sum >= 100: " + minLenAtLeast(a, 100));
        int r = minLenAtLeast(new int[]{3, -1, 4}, 5);
        System.out.println("with negatives: " + (r < 0 ? "not applicable" : String.valueOf(r)));
    }
}
