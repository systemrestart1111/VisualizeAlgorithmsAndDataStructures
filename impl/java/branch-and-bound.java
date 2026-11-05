import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class BranchAndBound {
    // 重量以「乘上 100 的整數」表示，避免浮點數誤差（3.14 -> 314）
    static int[] w = {200, 314, 198, 500, 300}, v = {40, 50, 100, 95, 30};
    static int n = 5, W = 1000, best = 0, nodes = 0;
    static Integer[] order = {0, 1, 2, 3, 4};
    static List<Integer> chosen = new ArrayList<>(), bestSet = new ArrayList<>();

    // 上界：剩下的物品依單位價值貪婪裝入，最後一件可以只裝一部分（分數背包的解一定不比整數解差）
    static double bound(int k, int cap, int value) {
        double val = value;
        for (int t = k; t < n; t++) {
            int i = order[t];
            if (w[i] <= cap) { cap -= w[i]; val += v[i]; }
            else return val + (double) v[i] * cap / w[i];
        }
        return val;
    }

    // 分支：第 k 件拿或不拿；限界：上界不超過目前最佳解就剪掉整棵子樹
    static void dfs(int k, int cap, int value) {
        nodes++;
        if (value > best) { best = value; bestSet = new ArrayList<>(chosen); }
        if (k == n || bound(k, cap, value) <= best + 1e-9) return;
        int i = order[k];
        if (w[i] <= cap) {
            chosen.add(i);
            dfs(k + 1, cap - w[i], value + v[i]);
            chosen.remove(chosen.size() - 1);
        }
        dfs(k + 1, cap, value);
    }

    public static void main(String[] args) {
        Arrays.sort(order, Comparator.comparingDouble(i -> -(double) v[i] / w[i]));
        dfs(0, W, 0);
        Collections.sort(bestSet);
        StringBuilder sb = new StringBuilder("best value = " + best + "\nitems:");
        for (int i : bestSet) sb.append(" I").append(i);
        System.out.println(sb + "\nnodes explored = " + nodes);
    }
}
