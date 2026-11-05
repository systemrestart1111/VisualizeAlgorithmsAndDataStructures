public class LinearSearch {
    // 從頭到尾逐一比較，找到回傳索引，找不到回傳 -1
    static int linearSearch(int[] a, int t) {
        for (int i = 0; i < a.length; i++)
            if (a[i] == t) return i;
        return -1;
    }

    public static void main(String[] args) {
        int[] a = {29, 4, 71, 15, 42, 8, 63, 37, 90, 22};
        System.out.println("search 63 -> " + linearSearch(a, 63));
        System.out.println("search 100 -> " + linearSearch(a, 100));
    }
}
