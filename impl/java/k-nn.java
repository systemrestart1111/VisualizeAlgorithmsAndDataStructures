import java.util.Arrays;
import java.util.TreeMap;

public class KNN {
    // 找出離查詢點最近的 k 筆訓練資料，以多數決決定類別（票數相同時取編號小的類別）
    public static void main(String[] args) {
        int[][] T = {{2, 3, 0}, {3, 5, 0}, {4, 2, 0}, {1, 6, 0}, {5, 4, 0}, {3, 3, 0}, {8, 8, 1}, {9, 6, 1},
                     {7, 9, 1}, {10, 8, 1}, {8, 6, 1}, {6, 7, 1}, {5, 9, 2}, {3, 9, 2}, {4, 10, 2}, {2, 8, 2}};
        int qx = 6, qy = 5, K = 5, n = T.length;
        int[] d2 = new int[n];
        Integer[] order = new Integer[n];
        for (int i = 0; i < n; i++) { order[i] = i; d2[i] = (T[i][0] - qx) * (T[i][0] - qx) + (T[i][1] - qy) * (T[i][1] - qy); }
        Arrays.sort(order, (a, b) -> d2[a] != d2[b] ? d2[a] - d2[b] : a - b);
        TreeMap<Integer, Integer> votes = new TreeMap<>();
        for (int t = 0; t < K; t++) {
            int i = order[t];
            System.out.println("neighbor (" + T[i][0] + "," + T[i][1] + ") class " + T[i][2] + ", d^2 = " + d2[i]);
            votes.merge(T[i][2], 1, Integer::sum);
        }
        int pred = -1;
        StringBuilder sb = new StringBuilder("votes:");
        for (var e : votes.entrySet()) {
            sb.append(" class ").append(e.getKey()).append('=').append(e.getValue());
            if (pred < 0 || e.getValue() > votes.get(pred)) pred = e.getKey();
        }
        System.out.println(sb + "\npredicted class = " + pred);
    }
}
