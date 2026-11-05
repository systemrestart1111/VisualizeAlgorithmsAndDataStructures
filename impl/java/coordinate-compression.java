import java.util.*;

public class CoordinateCompression {
    public static void main(String[] args) {
        int[] a = {1000000, 30, -5, 30, 99999, 7, -5, 2000};
        // 把每個值換成它在「排序後去重複」陣列中的排名
        int[] vals = Arrays.stream(a).distinct().sorted().toArray();
        int[] ranks = new int[a.length];
        for (int i = 0; i < a.length; i++) ranks[i] = Arrays.binarySearch(vals, a[i]);
        StringBuilder sb = new StringBuilder("values:");
        for (int v : vals) sb.append(' ').append(v);
        System.out.println(sb);
        sb = new StringBuilder("ranks :");
        for (int r : ranks) sb.append(' ').append(r);
        System.out.println(sb);
        boolean ok = true;
        for (int i = 0; i < a.length; i++) for (int j = 0; j < a.length; j++) ok &= ((a[i] < a[j]) == (ranks[i] < ranks[j])) && ((a[i] == a[j]) == (ranks[i] == ranks[j]));
        System.out.println("order preserved: " + (ok ? "True" : "False"));
    }
}
