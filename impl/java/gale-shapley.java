import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.util.Map;

public class GaleShapley {
    public static void main(String[] args) {
        String men = "ABCD", women = "XYZW";
        String[] mp = {"XYZW", "YXWZ", "XZYW", "ZWXY"}; // 求婚方的偏好（由高到低）
        String[] wp = {"BADC", "ACBD", "CDAB", "DBCA"}; // 被求婚方的偏好
        int[][] rank = new int[4][4];
        for (int w = 0; w < 4; w++)
            for (int i = 0; i < 4; i++) rank[w][men.indexOf(wp[w].charAt(i))] = i;
        // 自由的求婚者依序向下一個還沒求過的對象求婚；對方若更喜歡他就換掉現任
        Deque<Integer> free = new ArrayDeque<>();
        for (int m = 0; m < 4; m++) free.add(m);
        int[] nxt = new int[4], partner = {-1, -1, -1, -1};
        while (!free.isEmpty()) {
            int m = free.poll(), w = women.indexOf(mp[m].charAt(nxt[m]++));
            char M = men.charAt(m), W = women.charAt(w);
            if (partner[w] < 0) {
                partner[w] = m;
                System.out.println(M + " proposes " + W + ": accepted");
            } else if (rank[w][m] < rank[w][partner[w]]) {
                System.out.println(M + " proposes " + W + ": accepted, " + men.charAt(partner[w]) + " is free again");
                free.add(partner[w]);
                partner[w] = m;
            } else {
                System.out.println(M + " proposes " + W + ": rejected");
                free.add(m);
            }
        }
        StringBuilder sb = new StringBuilder("stable matching:");
        for (int m = 0; m < 4; m++)
            for (int w = 0; w < 4; w++) if (partner[w] == m) sb.append(' ').append(men.charAt(m)).append('-').append(women.charAt(w));
        System.out.println(sb);
    }
}
