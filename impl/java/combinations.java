import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class Combinations {
    static int n = 5, k = 3, count = 0;
    static List<Integer> cur = new ArrayList<>();

    // 從 start 開始挑下一個數，保證組合內遞增、不會重複；剩下的數不夠湊滿 k 個就剪枝
    static void bt(int start) {
        if (cur.size() == k) {
            System.out.println(cur.stream().map(String::valueOf).collect(Collectors.joining(" ")));
            count++;
            return;
        }
        for (int x = start; x <= n - (k - cur.size()) + 1; x++) {
            cur.add(x);
            bt(x + 1);
            cur.remove(cur.size() - 1);
        }
    }

    public static void main(String[] args) {
        bt(1);
        System.out.println("count = " + count);
    }
}
