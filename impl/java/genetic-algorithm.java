import java.util.*;

public class GeneticAlgorithm {
    static final int NI = 12, POP = 16, CAP = 25;
    static int[] W = {12, 2, 1, 4, 1, 6, 3, 5, 9, 7, 8, 2}, V = {4, 2, 1, 10, 2, 7, 5, 8, 9, 6, 11, 3};
    static Integer[] byRatio = new Integer[NI];
    static long st;
    static long nxt() { st = st * 48271 % 2147483647; return st; }
    static int weight(int[] c) { int s = 0; for (int i = 0; i < NI; i++) s += c[i] * W[i]; return s; }
    static int value(int[] c) { int s = 0; for (int i = 0; i < NI; i++) s += c[i] * V[i]; return s; }
    // 超重時依價值重量比由差到好拿掉物品，保持可行
    static void repair(int[] c) { for (int i : byRatio) { if (weight(c) <= CAP) break; c[i] = 0; } }
    static int[] bestOf(int[][] pop) { int b = 0; for (int i = 1; i < POP; i++) if (value(pop[i]) > value(pop[b])) b = i; return pop[b]; }
    static int[] tour(int[][] pop) { int b = (int) (nxt() % POP); for (int k = 0; k < 2; k++) { int c = (int) (nxt() % POP); if (value(pop[c]) > value(pop[b])) b = c; } return pop[b]; }

    // 錦標賽選擇（3 取 1）、單點交配、位元突變、菁英保留
    static void genetic(long seed, int gens, double pm) {
        st = seed;
        int[][] pop = new int[POP][NI];
        for (int[] c : pop) { for (int i = 0; i < NI; i++) c[i] = (int) (nxt() % 2); repair(c); }
        for (int g = 0; g < gens; g++) {
            int[][] next = new int[POP][];
            next[0] = bestOf(pop).clone();
            for (int k = 1; k < POP; k++) {
                int[] a = tour(pop), b = tour(pop), child = new int[NI];
                int cut = 1 + (int) (nxt() % (NI - 1));
                for (int i = 0; i < NI; i++) { int bit = i < cut ? a[i] : b[i]; child[i] = nxt() / 2147483647.0 < pm ? 1 - bit : bit; }
                repair(child);
                next[k] = child;
            }
            pop = next;
        }
        int[] best = bestOf(pop);
        StringBuilder sb = new StringBuilder();
        for (int b : best) sb.append(b);
        System.out.println("seed " + seed + ", " + gens + " generations, mutation " + pm + ": best " + sb + ", weight " + weight(best) + ", value " + value(best));
    }

    public static void main(String[] args) {
        for (int i = 0; i < NI; i++) byRatio[i] = i;
        Arrays.sort(byRatio, Comparator.comparingDouble((Integer i) -> (double) V[i] / W[i]).thenComparingInt(i -> i));
        int[] dp = new int[CAP + 1];
        for (int k = 0; k < NI; k++) for (int c = CAP; c >= W[k]; c--) dp[c] = Math.max(dp[c], dp[c - W[k]] + V[k]);
        System.out.println("dynamic programming optimum: " + dp[CAP]);
        genetic(4, 30, 0.05);
        genetic(4, 80, 0.05);
        genetic(9, 30, 0.01);
        genetic(2, 30, 0.2);
    }
}
