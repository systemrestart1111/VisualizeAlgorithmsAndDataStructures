import java.util.Arrays;
import java.util.Comparator;

public class JobSequencing {
    // 依利潤由高到低考慮；每份工作排進「截止前最晚的空時段」，讓前面的時段留給截止較早的工作
    public static void main(String[] args) {
        int[][] jobs = {{2, 100}, {1, 19}, {2, 27}, {1, 25}, {3, 15}, {3, 40}, {4, 30}}; // (截止時間, 利潤)
        int n = jobs.length, maxD = 0, total = 0;
        for (int[] j : jobs) maxD = Math.max(maxD, j[0]);
        Integer[] order = new Integer[n];
        for (int i = 0; i < n; i++) order[i] = i;
        Arrays.sort(order, Comparator.comparingInt(i -> -jobs[i][1]));
        int[] slot = new int[maxD + 1];
        Arrays.fill(slot, -1);
        for (int i : order)
            for (int t = jobs[i][0]; t >= 1; t--)
                if (slot[t] < 0) { slot[t] = i; total += jobs[i][1]; break; }
        for (int t = 1; t <= maxD; t++)
            System.out.println("slot " + t + ": " + (slot[t] >= 0 ? "J" + (slot[t] + 1) + " (profit " + jobs[slot[t]][1] + ")" : "-"));
        System.out.println("total profit = " + total);
    }
}
