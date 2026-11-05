import java.util.Arrays;

public class TrappingRainWater {
    // 雙指標：較矮那一側的最高牆決定該側水位
    static int trap(int[] h) {
        int l = 0, r = h.length - 1, lm = 0, rm = 0, water = 0;
        while (l < r) {
            if (h[l] < h[r]) { lm = Math.max(lm, h[l]); water += lm - h[l]; l++; }
            else { rm = Math.max(rm, h[r]); water += rm - h[r]; r--; }
        }
        return water;
    }
    static int baseline(int[] h) {
        int s = 0;
        for (int i = 0; i < h.length; i++) {
            int L = 0, R = 0;
            for (int j = 0; j <= i; j++) L = Math.max(L, h[j]);
            for (int j = i; j < h.length; j++) R = Math.max(R, h[j]);
            s += Math.min(L, R) - h[i];
        }
        return s;
    }

    public static void main(String[] args) {
        int[][] tests = {{0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1}, {4, 2, 0, 3, 2, 5}, {1, 2, 3}, {5}};
        for (int[] h : tests) System.out.println(Arrays.toString(h) + " water: " + trap(h) + " baseline: " + baseline(h));
    }
}
