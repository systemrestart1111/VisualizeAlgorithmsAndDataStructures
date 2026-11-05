import java.util.Arrays;

public class Minimax {
    // 由下往上：MAX 層取子節點最大值、MIN 層取最小值（根為 MAX，層數交替）
    public static void main(String[] args) {
        int[] vals = {3, 5, 6, 9, 1, 2, 0, -1, 8, 4, 7, 2, 5, 1, 3, 6};
        int B = 2, depth = 0;
        for (int p = 1; p < vals.length; p *= B) depth++;
        for (int d = depth - 1; d >= 0; d--) {
            boolean isMax = d % 2 == 0;
            int[] next = new int[vals.length / B];
            for (int i = 0; i < next.length; i++) {
                int[] group = Arrays.copyOfRange(vals, i * B, i * B + B);
                next[i] = isMax ? Arrays.stream(group).max().getAsInt() : Arrays.stream(group).min().getAsInt();
            }
            vals = next;
            StringBuilder sb = new StringBuilder("level " + d + " (" + (isMax ? "MAX" : "MIN") + "):");
            for (int v : vals) sb.append(' ').append(v);
            System.out.println(sb);
        }
        System.out.println("root value = " + vals[0]);
    }
}
