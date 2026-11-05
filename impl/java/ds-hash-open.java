public class HashOpenAddressing {
    // 所有鍵都放在同一個陣列；碰撞時線性探測下一格。刪除要留「墓碑」，否則會截斷後面鍵的探測路徑
    static final int EMPTY = -1, DELETED = -2;
    static int[] slots = new int[11];

    static int insert(int k) {
        int m = slots.length, firstTomb = -1;
        for (int i = 0; i < m; i++) {
            int idx = (k + i) % m;
            if (slots[idx] == k) return idx; // 已存在
            if (slots[idx] == DELETED && firstTomb < 0) firstTomb = idx; // 先記下來，繼續往後確認 k 不存在
            if (slots[idx] == EMPTY) {
                int target = firstTomb >= 0 ? firstTomb : idx;
                slots[target] = k;
                return target;
            }
        }
        if (firstTomb >= 0) { slots[firstTomb] = k; return firstTomb; }
        return -1; // 表已滿
    }

    static int[] search(int k) {
        int m = slots.length, probes = 0;
        for (int i = 0; i < m; i++) {
            int idx = (k + i) % m;
            probes++;
            if (slots[idx] == EMPTY) return new int[] {-1, probes};
            if (slots[idx] == k) return new int[] {idx, probes};
        }
        return new int[] {-1, probes};
    }

    static String str() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < slots.length; i++)
            sb.append(i > 0 ? " " : "").append(slots[i] == EMPTY ? "." : slots[i] == DELETED ? "X" : String.valueOf(slots[i]));
        return sb.toString();
    }

    public static void main(String[] args) {
        java.util.Arrays.fill(slots, EMPTY);
        for (int k : new int[] {22, 1, 13, 11, 24, 33, 18}) {
            int s = insert(k);
            System.out.println(String.format("insert %2d -> slot %2d   [%s]", k, s, str()));
        }
        int[] r = search(33);
        System.out.println("search 33 -> (slot, probes) = (" + r[0] + ", " + r[1] + ")");
        r = search(13);
        if (r[0] >= 0) slots[r[0]] = DELETED;
        System.out.println("delete 13 -> " + (r[0] >= 0 ? "True" : "False") + "   [" + str() + "]");
        r = search(24);
        System.out.println("search 24 -> (slot, probes) = (" + r[0] + ", " + r[1] + ") (passes the tombstone)");
        int s = insert(35);
        System.out.println(String.format("insert 35 -> slot %2d   [%s] (reuses the tombstone)", s, str()));
    }
}
