import java.util.ArrayList;
import java.util.List;

public class SkipListDemo {
    static final int MAX_LEVEL = 4;

    static class SNode {
        int val;
        SNode[] next;
        SNode(int v, int level) { val = v; next = new SNode[level]; }
    }

    // 多層排序串列：每個節點以 1/2 機率往上多一層，搜尋時從最高層往下跳，期望 O(log n)
    static SNode head = new SNode(0, MAX_LEVEL);
    static int level = 1;
    static long state = 42; // Park–Miller 亂數，讓每種語言都得到相同的層數

    static int randInt(int k) {
        state = state * 48271 % 2147483647;
        return (int) (state % k);
    }

    static int randomLevel() {
        int lvl = 1;
        while (lvl < MAX_LEVEL && randInt(2) == 0) lvl++;
        return lvl;
    }

    // 回傳每一層「最後一個 < k 的節點」
    static SNode[] findUpdate(int k) {
        SNode[] update = new SNode[MAX_LEVEL];
        java.util.Arrays.fill(update, head);
        SNode x = head;
        for (int i = level - 1; i >= 0; i--) {
            while (x.next[i] != null && x.next[i].val < k) x = x.next[i];
            update[i] = x;
        }
        return update;
    }

    static int insert(int k) {
        SNode[] update = findUpdate(k);
        SNode nxt = update[0].next[0];
        if (nxt != null && nxt.val == k) return 0;
        int lvl = randomLevel();
        level = Math.max(level, lvl);
        SNode n = new SNode(k, lvl);
        for (int i = 0; i < lvl; i++) { n.next[i] = update[i].next[i]; update[i].next[i] = n; }
        return lvl;
    }

    static boolean search(int k, List<Integer> visited) {
        SNode x = head;
        for (int i = level - 1; i >= 0; i--)
            while (x.next[i] != null && x.next[i].val < k) { x = x.next[i]; visited.add(x.val); }
        x = x.next[0];
        return x != null && x.val == k;
    }

    static boolean delete(int k) {
        SNode[] update = findUpdate(k);
        SNode x = update[0].next[0];
        if (x == null || x.val != k) return false;
        for (int i = 0; i < x.next.length; i++) update[i].next[i] = x.next[i];
        while (level > 1 && head.next[level - 1] == null) level--;
        return true;
    }

    static void show() {
        for (int i = level - 1; i >= 0; i--) {
            StringBuilder sb = new StringBuilder("  L" + i + ":");
            for (SNode x = head.next[i]; x != null; x = x.next[i]) sb.append(' ').append(x.val);
            System.out.println(sb);
        }
    }

    public static void main(String[] args) {
        for (int k : new int[] {30, 10, 50, 20, 70, 40, 60, 80, 25}) System.out.println("insert " + k + " (level " + insert(k) + ")");
        show();
        for (int k : new int[] {60, 45}) {
            List<Integer> visited = new ArrayList<>();
            boolean found = search(k, visited);
            StringBuilder sb = new StringBuilder("search " + k + ": " + (found ? "found" : "not found") + ", visited");
            for (int v : visited) sb.append(' ').append(v);
            System.out.println(sb);
        }
        System.out.println("delete 40 -> " + (delete(40) ? "True" : "False"));
        show();
    }
}
