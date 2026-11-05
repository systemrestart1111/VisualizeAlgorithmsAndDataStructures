import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class AlgorithmX {
    // Knuth 的 Algorithm X：挑候選最少的欄，逐一嘗試涵蓋它的列；選了某列就移除它的所有欄與衝突的列，失敗再還原
    // （舞蹈鏈 Dancing Links 是用雙向環狀鏈結串列讓「移除／還原」變成 O(1) 的實作方式，搜尋邏輯相同）
    static final int NC = 7;
    static String[] names = {"A", "B", "C", "D", "E", "F"};
    static int[][] sets = {{1, 4, 7}, {1, 4}, {4, 5, 7}, {3, 5, 6}, {2, 3, 6, 7}, {2, 7}};
    static boolean[] active = {true, true, true, true, true, true}, covered = new boolean[NC + 1];
    static List<Integer> sol = new ArrayList<>();
    static int total = 0;

    static boolean has(int r, int c) {
        for (int x : sets[r]) if (x == c) return true;
        return false;
    }

    static void search() {
        int col = -1, best = Integer.MAX_VALUE;
        for (int c = 1; c <= NC; c++) {
            if (covered[c]) continue;
            int k = 0;
            for (int r = 0; r < 6; r++) if (active[r] && has(r, c)) k++;
            if (k < best) { best = k; col = c; } // 同數量時取編號小的欄
        }
        if (col < 0) {
            List<Integer> s = new ArrayList<>(sol);
            Collections.sort(s);
            StringBuilder sb = new StringBuilder("solution: {");
            for (int i = 0; i < s.size(); i++) sb.append(i > 0 ? " " : "").append(names[s.get(i)]);
            System.out.println(sb.append('}'));
            total++;
            return;
        }
        for (int r = 0; r < 6; r++) {
            if (!active[r] || !has(r, col)) continue;
            sol.add(r);
            List<Integer> removed = new ArrayList<>();
            for (int r2 = 0; r2 < 6; r2++) {
                if (!active[r2]) continue;
                for (int c : sets[r]) if (has(r2, c)) { removed.add(r2); break; }
            }
            for (int c : sets[r]) covered[c] = true;
            for (int r2 : removed) active[r2] = false;
            search();
            for (int r2 : removed) active[r2] = true; // 還原
            for (int c : sets[r]) covered[c] = false;
            sol.remove(sol.size() - 1);
        }
    }

    public static void main(String[] args) {
        search();
        System.out.println("total solutions = " + total);
    }
}
