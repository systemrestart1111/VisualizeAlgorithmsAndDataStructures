public class Boruvka {
    static int[] parent = new int[7];

    static int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }

    public static void main(String[] args) {
        int[][] E = {{0, 1, 7}, {0, 3, 5}, {1, 2, 8}, {1, 3, 9}, {1, 4, 7}, {2, 4, 5}, {3, 4, 15}, {3, 5, 6}, {4, 5, 8}, {4, 6, 9}, {5, 6, 11}};
        int m = E.length, n = 7, total = 0, comps = n, rnd = 0;
        for (int v = 0; v < n; v++) parent[v] = v;
        // 每一輪：每個連通塊各自找一條最便宜的對外邊（同權重取編號小的），全部一起加入；塊數每輪至少減半
        while (comps > 1) {
            int[] cheapest = new int[n];
            java.util.Arrays.fill(cheapest, -1);
            boolean[] pick = new boolean[m];
            for (int i = 0; i < m; i++) {
                int[] r = {find(E[i][0]), find(E[i][1])};
                if (r[0] == r[1]) continue;
                for (int k = 0; k < 2; k++) {
                    int c = cheapest[r[k]];
                    if (c < 0 || E[i][2] < E[c][2] || (E[i][2] == E[c][2] && i < c)) cheapest[r[k]] = i;
                }
            }
            for (int c : cheapest) if (c >= 0) pick[c] = true;
            StringBuilder sb = new StringBuilder("round " + (++rnd) + ":");
            for (int i = 0; i < m; i++) {
                if (!pick[i] || find(E[i][0]) == find(E[i][1])) continue;
                parent[find(E[i][0])] = find(E[i][1]);
                total += E[i][2];
                comps--;
                sb.append(' ').append((char) ('A' + E[i][0])).append('-').append((char) ('A' + E[i][1])).append('(').append(E[i][2]).append(')');
            }
            System.out.println(sb);
        }
        System.out.println("total weight = " + total);
    }
}
