import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class MedianOfMedians {
    // BFPRT：每 5 個一組取中位數，再遞迴取「中位數的中位數」當 pivot，保證最壞 O(n)
    static int select(List<Integer> a, int k) {
        if (a.size() <= 5) {
            List<Integer> b = new ArrayList<>(a);
            Collections.sort(b);
            return b.get(k);
        }
        List<Integer> med = new ArrayList<>();
        for (int i = 0; i < a.size(); i += 5) {
            List<Integer> g = new ArrayList<>(a.subList(i, Math.min(a.size(), i + 5)));
            Collections.sort(g);
            med.add(g.get(g.size() / 2));
        }
        int pivot = select(med, med.size() / 2);
        List<Integer> lows = new ArrayList<>(), highs = new ArrayList<>();
        for (int x : a) {
            if (x < pivot) lows.add(x);
            else if (x > pivot) highs.add(x);
        }
        int eq = a.size() - lows.size() - highs.size();
        if (k < lows.size()) return select(lows, k);
        if (k < lows.size() + eq) return pivot;
        return select(highs, k - lows.size() - eq);
    }

    public static void main(String[] args) {
        List<Integer> a = List.of(12, 3, 5, 7, 4, 19, 26, 1, 14, 8, 22, 17, 9, 30, 2, 11, 25, 6, 15, 20, 28, 10, 13);
        System.out.println("k = 11 -> " + select(a, 11));
    }
}
