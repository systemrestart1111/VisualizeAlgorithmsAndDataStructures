import java.util.Arrays;

public class RecursiveBubbleSort {
    // 一輪把最大值推到 n-1，再遞迴處理前 n-1 個；沒有交換就提早結束。回傳呼叫次數
    static int bubble(int[] a, int n) {
        if (n <= 1) return 1;
        boolean swapped = false;
        for (int j = 0; j < n - 1; j++)
            if (a[j] > a[j + 1]) { int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; swapped = true; }
        if (!swapped) return 1;
        return 1 + bubble(a, n - 1);
    }

    public static void main(String[] args) {
        int[][] tests = {{38, 27, 43, 3, 9, 82, 10, 55}, {}, {7}, {1, 2, 3, 4}};
        for (int[] a : tests) {
            int calls = bubble(a, a.length);
            System.out.println("sorted: " + Arrays.toString(a) + " calls: " + calls);
        }
    }
}
