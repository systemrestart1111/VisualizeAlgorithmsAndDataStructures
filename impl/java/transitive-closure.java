public class TransitiveClosure {
    // Warshall：依序讓每個頂點 k 當中繼站，R[i][j] |= R[i][k] && R[k][j]
    static boolean[][] closure(int n, String[] edges, boolean reflexive) {
        boolean[][] R = new boolean[n][n];
        for (int i = 0; i < n; i++) R[i][i] = reflexive;
        for (String e : edges) R[e.charAt(0) - 'A'][e.charAt(1) - 'A'] = true;
        for (int k = 0; k < n; k++)
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++) R[i][j] = R[i][j] || (R[i][k] && R[k][j]);
        return R;
    }

    public static void main(String[] args) {
        String[] edges = {"AB", "BC", "CA", "CD", "ED", "EF"};
        for (boolean refl : new boolean[]{false, true}) {
            boolean[][] R = closure(6, edges, refl);
            System.out.println(refl ? "reflexive" : "non-reflexive");
            System.out.println("  A B C D E F");
            for (int i = 0; i < 6; i++) {
                StringBuilder sb = new StringBuilder().append((char) ('A' + i));
                for (boolean x : R[i]) sb.append(' ').append(x ? 1 : 0);
                System.out.println(sb);
            }
        }
    }
}
