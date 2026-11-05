public class RobinHoodHashing {
    static final int M = 11;
    static int[] key = new int[M], dist = new int[M];
    static boolean[] used = new boolean[M];

    static int find(int x) {
        for (int i = x % M, d = 0; d < M; i = (i + 1) % M, d++) {
            if (!used[i] || dist[i] < d) return -1;
            if (key[i] == x) return i;
        }
        return -1;
    }
    // 線性探測 + 劫富濟貧：遇到探測距離比自己小的元素就交換
    static void insert(int x) {
        if (find(x) >= 0) return;
        int ck = x, cd = 0;
        for (int i = x % M;; i = (i + 1) % M, cd++) {
            if (!used[i]) { used[i] = true; key[i] = ck; dist[i] = cd; return; }
            if (dist[i] < cd) { int tk = key[i], td = dist[i]; key[i] = ck; dist[i] = cd; ck = tk; cd = td; }
        }
    }
    // 後移刪除：後面距離 > 0 的元素往前移一格
    static void delete(int x) {
        int i = find(x);
        if (i < 0) return;
        used[i] = false;
        for (int j = (i + 1) % M; used[j] && dist[j] > 0; i = j, j = (j + 1) % M) {
            used[i] = true; key[i] = key[j]; dist[i] = dist[j] - 1; used[j] = false;
        }
    }
    static String show() { StringBuilder sb = new StringBuilder(); for (int i = 0; i < M; i++) sb.append(i > 0 ? " " : "").append(used[i] ? key[i] + "/" + dist[i] : "."); return sb.toString(); }

    public static void main(String[] args) {
        for (int x : new int[]{22, 33, 1, 12, 44, 5, 16, 27}) insert(x);
        System.out.println("table: " + show());
        System.out.println("find 27: " + find(27) + " | find 9: " + find(9));
        delete(33);
        System.out.println("after delete 33: " + show());
        System.out.println("find 44: " + find(44) + " | find 27: " + find(27));
    }
}
