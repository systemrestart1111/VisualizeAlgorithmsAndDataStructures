public class JumpSearch {
    // a 已排序；每次跳 √n 格找到區塊，再在區塊內線性搜尋
    static int jumpSearch(int[] a, int t) {
        int n = a.length, step = (int) Math.sqrt(n);
        int prev = 0, cur = step;
        while (cur < n && a[cur - 1] < t) {
            prev = cur;
            cur += step;
        }
        for (int i = prev; i < Math.min(cur, n); i++)
            if (a[i] == t) return i;
        return -1;
    }

    public static void main(String[] args) {
        int[] a = {1, 4, 7, 10, 14, 18, 21, 25, 29, 33, 38, 42, 47, 51, 56, 60};
        System.out.println("search 47 -> " + jumpSearch(a, 47));
        System.out.println("search 30 -> " + jumpSearch(a, 30));
    }
}
