import java.util.Arrays;
import java.util.stream.Collectors;

public class CountingSort {
    // 統計每個值出現的次數，再用前綴和決定每個元素的最終位置（穩定）
    static int[] countingSort(int[] a) {
        int k = Arrays.stream(a).max().getAsInt() + 1;
        int[] cnt = new int[k], out = new int[a.length];
        for (int x : a) cnt[x]++;
        for (int v = 1; v < k; v++) cnt[v] += cnt[v - 1];
        for (int i = a.length - 1; i >= 0; i--) out[--cnt[a[i]]] = a[i];
        return out;
    }

    public static void main(String[] args) {
        int[] a = {4, 2, 7, 1, 4, 9, 3, 2, 7, 0, 5, 4, 8, 1};
        System.out.println(Arrays.stream(countingSort(a)).mapToObj(String::valueOf).collect(Collectors.joining(" ")));
    }
}
