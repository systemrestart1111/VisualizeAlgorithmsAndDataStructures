import java.util.ArrayList;
import java.util.List;

public class Permutations {
    static String[] items = {"1", "2", "3"};
    static boolean[] used = new boolean[items.length];
    static List<String> cur = new ArrayList<>();

    // 每一層選一個還沒用過的元素放進目前位置，到底就輸出；返回時把它標回未使用（回溯）
    static void bt() {
        if (cur.size() == items.length) {
            System.out.println(String.join(" ", cur));
            return;
        }
        for (int i = 0; i < items.length; i++)
            if (!used[i]) {
                used[i] = true;
                cur.add(items[i]);
                bt();
                cur.remove(cur.size() - 1);
                used[i] = false;
            }
    }

    public static void main(String[] args) { bt(); }
}
