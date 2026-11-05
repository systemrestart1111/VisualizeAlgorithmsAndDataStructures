import java.util.ArrayList;
import java.util.List;

public class Subsets {
    static String[] items = {"a", "b", "c"};
    static List<String> cur = new ArrayList<>();
    static int count = 0;

    // 每個節點都是一個子集合：輸出目前的集合，再嘗試從 start 之後加入下一個元素
    static void bt(int start) {
        System.out.println("{" + String.join(" ", cur) + "}");
        count++;
        for (int i = start; i < items.length; i++) {
            cur.add(items[i]);
            bt(i + 1);
            cur.remove(cur.size() - 1);
        }
    }

    public static void main(String[] args) {
        bt(0);
        System.out.println("count = " + count);
    }
}
