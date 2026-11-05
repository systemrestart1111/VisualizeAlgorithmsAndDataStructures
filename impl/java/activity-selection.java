import java.util.Arrays;
import java.util.Comparator;

public class ActivitySelection {
    // 依結束時間排序，每次選最早結束、且不與已選區間重疊的活動
    public static void main(String[] args) {
        Integer[][] iv = {{1, 4}, {3, 5}, {0, 6}, {5, 7}, {3, 9}, {5, 9}, {6, 10}, {8, 11}, {8, 12}, {2, 14}, {12, 16}};
        Arrays.sort(iv, Comparator.comparingInt(a -> a[1])); // 物件陣列排序是穩定的
        int end = Integer.MIN_VALUE, cnt = 0;
        StringBuilder sb = new StringBuilder("selected:");
        for (Integer[] p : iv)
            if (p[0] >= end) { sb.append(" [").append(p[0]).append(',').append(p[1]).append(')'); end = p[1]; cnt++; }
        System.out.println(sb + "\ncount = " + cnt);
    }
}
