import java.util.Arrays;
import java.util.stream.Collectors;

public class CocktailSort {
    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }

    // 雙向氣泡排序：先由左往右把最大值推到右端，再由右往左把最小值推到左端
    static void cocktailSort(int[] a) {
        int lo = 0, hi = a.length - 1;
        boolean swapped = true;
        while (swapped && lo < hi) {
            swapped = false;
            for (int i = lo; i < hi; i++)
                if (a[i] > a[i + 1]) { swap(a, i, i + 1); swapped = true; }
            hi--;
            for (int i = hi; i > lo; i--)
                if (a[i - 1] > a[i]) { swap(a, i - 1, i); swapped = true; }
            lo++;
        }
    }

    public static void main(String[] args) {
        int[] a = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72};
        cocktailSort(a);
        System.out.println(Arrays.stream(a).mapToObj(String::valueOf).collect(Collectors.joining(" ")));
    }
}
