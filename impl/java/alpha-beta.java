import java.util.ArrayList;
import java.util.List;

public class AlphaBeta {
    static int[] leaves = {3, 5, 6, 9, 1, 2, 0, -1, 8, 4, 7, 2, 5, 1, 3, 6};
    static final int B = 2, DEPTH = 4;
    static List<Integer> visited = new ArrayList<>();

    // α：MAX 已保證的下界，β：MIN 已保證的上界；一旦 α >= β，剩下的兄弟節點不可能影響結果，直接剪掉
    static int ab(int depth, int index, int alpha, int beta, boolean isMax) {
        if (depth == DEPTH) { visited.add(index); return leaves[index]; }
        int best = isMax ? Integer.MIN_VALUE : Integer.MAX_VALUE;
        for (int k = 0; k < B; k++) {
            int v = ab(depth + 1, index * B + k, alpha, beta, !isMax);
            if (isMax) { best = Math.max(best, v); alpha = Math.max(alpha, v); }
            else { best = Math.min(best, v); beta = Math.min(beta, v); }
            if (alpha >= beta) break;
        }
        return best;
    }

    public static void main(String[] args) {
        int root = ab(0, 0, Integer.MIN_VALUE, Integer.MAX_VALUE, true);
        StringBuilder sb = new StringBuilder("leaves evaluated:");
        for (int i : visited) sb.append(' ').append(i);
        System.out.println("root value = " + root + "\n" + sb);
        System.out.println("pruned " + (leaves.length - visited.size()) + " of " + leaves.length + " leaves");
    }
}
