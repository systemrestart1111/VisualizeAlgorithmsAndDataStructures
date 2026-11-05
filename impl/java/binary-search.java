public class BinarySearch {
    // a 已排序；每次與中間元素比較，捨棄一半的搜尋範圍
    static int binarySearch(int[] a, int t) {
        int lo = 0, hi = a.length - 1;
        while (lo <= hi) {
            int mid = (lo + hi) >>> 1;
            if (a[mid] == t) return mid;
            if (a[mid] < t) lo = mid + 1;
            else hi = mid - 1;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] a = {3, 8, 12, 17, 23, 31, 38, 45, 52, 60, 67, 74, 81, 89, 95};
        System.out.println("search 67 -> " + binarySearch(a, 67));
        System.out.println("search 50 -> " + binarySearch(a, 50));
    }
}
