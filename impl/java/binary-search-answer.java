public class BinarySearchAnswer {
    // 對答案二分：hours(k) 隨 k 遞減，找最小可行的 k；h < 堆數時無解回傳 -1
    static int minSpeed(int[] p, int h) {
        if (h < p.length) return -1;
        int lo = 1, hi = 0;
        for (int x : p) hi = Math.max(hi, x);
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            long s = 0;
            for (int x : p) s += (x + mid - 1) / mid;
            if (s <= h) hi = mid; else lo = mid + 1;
        }
        return lo;
    }

    public static void main(String[] args) {
        int[] piles = {30, 11, 23, 4, 20};
        for (int h : new int[]{6, 5, 10, 100, 4}) {
            int k = minSpeed(piles, h);
            System.out.println("h = " + h + ": min speed = " + (k < 0 ? "impossible" : String.valueOf(k)));
        }
    }
}
