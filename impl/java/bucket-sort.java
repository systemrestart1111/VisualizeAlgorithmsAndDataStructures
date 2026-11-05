import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class BucketSort {
    // 依數值範圍把元素分進 k 個桶，各桶內排序後依序串接
    static List<Integer> bucketSort(int[] a, int k) {
        int lo = Integer.MAX_VALUE, hi = Integer.MIN_VALUE;
        for (int x : a) { lo = Math.min(lo, x); hi = Math.max(hi, x); }
        List<List<Integer>> buckets = new ArrayList<>();
        for (int i = 0; i < k; i++) buckets.add(new ArrayList<>());
        for (int x : a) buckets.get((x - lo) * k / (hi - lo + 1)).add(x);
        List<Integer> out = new ArrayList<>();
        for (int i = 0; i < k; i++) {
            Collections.sort(buckets.get(i));
            StringBuilder sb = new StringBuilder("bucket " + i + ":");
            for (int x : buckets.get(i)) { sb.append(' ').append(x); out.add(x); }
            System.out.println(sb);
        }
        return out;
    }

    public static void main(String[] args) {
        int[] a = {29, 25, 3, 49, 9, 37, 21, 43, 12, 33, 6, 41, 17, 48};
        StringBuilder sb = new StringBuilder("sorted:");
        for (int x : bucketSort(a, 5)) sb.append(' ').append(x);
        System.out.println(sb);
    }
}
