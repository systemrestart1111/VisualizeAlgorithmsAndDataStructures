import java.util.Arrays;

public class KasaiLCP {
    // 依原字串順序處理後綴；相鄰後綴的 LCP 最多只會比前一個少 1，因此總共只需 O(n) 次比較
    static int[] kasai(String s, Integer[] sa) {
        int n = s.length();
        int[] rank = new int[n], lcp = new int[n]; // lcp[i] = sa[i] 與 sa[i-1] 的最長共同前綴
        for (int i = 0; i < n; i++) rank[sa[i]] = i;
        for (int i = 0, k = 0; i < n; i++) {
            if (rank[i] == 0) { k = 0; continue; }
            int j = sa[rank[i] - 1];
            while (i + k < n && j + k < n && s.charAt(i + k) == s.charAt(j + k)) k++;
            lcp[rank[i]] = k;
            if (k > 0) k--;
        }
        return lcp;
    }

    public static void main(String[] args) {
        String s = "banana$";
        int n = s.length();
        Integer[] sa = new Integer[n];
        for (int i = 0; i < n; i++) sa[i] = i;
        Arrays.sort(sa, (a, b) -> s.substring(a).compareTo(s.substring(b))); // 直接排序後綴取得後綴陣列
        int[] lcp = kasai(s, sa);
        System.out.println(" i  SA LCP suffix");
        for (int i = 0; i < n; i++) System.out.println(String.format("%2d %3d %3d %s", i, sa[i], lcp[i], s.substring(sa[i])));
    }
}
