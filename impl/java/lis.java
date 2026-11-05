import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class LIS {
    public static void main(String[] args) {
        int[] a = {10, 9, 2, 5, 3, 7, 101, 18, 4, 20};
        int n = a.length;
        // O(n²)：dp[i] = 以 a[i] 結尾的最長遞增子序列長度
        int[] dp = new int[n], parent = new int[n];
        for (int i = 0; i < n; i++) {
            dp[i] = 1; parent[i] = -1;
            for (int j = 0; j < i; j++)
                if (a[j] < a[i] && dp[j] + 1 > dp[i]) { dp[i] = dp[j] + 1; parent[i] = j; }
        }
        int end = 0;
        for (int i = 1; i < n; i++) if (dp[i] > dp[end]) end = i; // 同長度取最先出現的結尾
        List<Integer> seq = new ArrayList<>();
        for (int e = end; e >= 0; e = parent[e]) seq.add(a[e]);
        Collections.reverse(seq);
        StringBuilder sb = new StringBuilder("LIS length = " + dp[end] + "\none LIS =");
        for (int x : seq) sb.append(' ').append(x);
        System.out.println(sb);
        // O(n log n)：tails[k] = 長度 k+1 的遞增子序列最小可能結尾，用二分搜尋更新
        List<Integer> tails = new ArrayList<>();
        for (int x : a) {
            int k = Collections.binarySearch(tails, x);
            if (k < 0) k = -k - 1;
            if (k == tails.size()) tails.add(x);
            else tails.set(k, x);
        }
        sb = new StringBuilder("tails:");
        for (int x : tails) sb.append(' ').append(x);
        System.out.println(sb);
    }
}
