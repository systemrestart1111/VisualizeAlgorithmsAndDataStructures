import java.util.*;

public class SubarraySumK {
    // 以前綴和 p 結尾的子陣列個數 = 之前出現過幾次前綴和 p − k；先查詢再登錄
    static int countK(int[] a, int k) {
        Map<Integer, Integer> cnt = new HashMap<>();
        cnt.put(0, 1);
        int p = 0, ans = 0;
        for (int x : a) {
            p += x;
            ans += cnt.getOrDefault(p - k, 0);
            cnt.merge(p, 1, Integer::sum);
        }
        return ans;
    }

    public static void main(String[] args) {
        int[][] as = {{1, 2, -1, 3, 0, -2, 4, 1, -3}, {0, 0, 0}, {1, -1, 1, -1}, {5}};
        int[] ks = {3, 0, 0, 3};
        for (int t = 0; t < as.length; t++) {
            int[] a = as[t];
            int brute = 0;
            for (int i = 0; i < a.length; i++) { int s = 0; for (int j = i; j < a.length; j++) { s += a[j]; if (s == ks[t]) brute++; } }
            System.out.println(Arrays.toString(a) + " k = " + ks[t] + " -> " + countK(a, ks[t]) + " brute: " + brute);
        }
    }
}
