public class BoyerMooreMajority {
    // 多數投票：相同就 +1、不同就 -1，歸零時換候選人；最後再驗證一次是否過半
    public static void main(String[] args) {
        int[] a = {2, 2, 1, 3, 2, 1, 2, 2, 3, 2, 1, 2, 2};
        int cand = 0, count = 0, occ = 0;
        for (int x : a) {
            if (count == 0) cand = x;
            count += x == cand ? 1 : -1;
        }
        for (int x : a) if (x == cand) occ++;
        String m = occ * 2 > a.length ? String.valueOf(cand) : "None";
        System.out.println("majority = " + m + " (" + occ + "/" + a.length + ")");
    }
}
