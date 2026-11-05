import java.util.Arrays;
import java.util.Comparator;

public class FractionalKnapsack {
    // 依「單位重量價值」由高到低裝；最後一件裝不下就只裝一部分
    public static void main(String[] args) {
        int[][] items = {{10, 60}, {20, 100}, {30, 120}, {5, 50}, {15, 45}}; // (重量, 價值)
        int left = 50;
        Integer[] order = {0, 1, 2, 3, 4};
        Arrays.sort(order, Comparator.comparingDouble(i -> -(double) items[i][1] / items[i][0]));
        double total = 0;
        for (int i : order) {
            if (left == 0) break;
            int w = items[i][0], v = items[i][1], take = Math.min(w, left);
            total += (double) v * take / w;
            left -= take;
            System.out.println(String.format("item %d (w=%d, v=%d, ratio=%.2f): take %d/%d", i, w, v, (double) v / w, take, w));
        }
        System.out.println(String.format("total value = %.2f", total));
    }
}
