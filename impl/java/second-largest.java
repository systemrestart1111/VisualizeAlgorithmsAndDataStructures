import java.util.Arrays;

public class SecondLargest {
    // 一次掃描維護 first 與 second；distinct=true 求第二大相異值，不存在回傳 null
    static Integer secondLargest(int[] a, boolean distinct) {
        Integer first = null, second = null;
        for (int x : a) {
            if (first == null || x > first) { second = first; first = x; }
            else if (x == first) { if (!distinct) second = x; }
            else if (second == null || x > second) second = x;
        }
        return second;
    }

    public static void main(String[] args) {
        int[][] tests = {{12, 35, 1, 10, 34, 35, 1}, {5, 5, 3}, {7, 7, 7}, {4}};
        for (int[] a : tests) {
            Integer d = secondLargest(a, true), r = secondLargest(a, false);
            System.out.println(Arrays.toString(a) + " distinct: " + (d == null ? "none" : d) + " rank: " + (r == null ? "none" : r));
        }
    }
}
