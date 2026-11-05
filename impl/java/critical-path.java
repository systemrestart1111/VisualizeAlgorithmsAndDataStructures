import java.util.*;

public class CriticalPath {
    public static void main(String[] args) {
        char[] names = {'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'};
        int[] dur = {3, 2, 4, 2, 2, 3, 4, 1};
        String[] deps = {"", "A", "A", "B", "C", "DE", "", "G"};
        int n = names.length, T = 0;
        int[] ES = new int[n], EF = new int[n], LS = new int[n], LF = new int[n];
        // 正向算 ES/EF（工作依前置先後列出）
        for (int i = 0; i < n; i++) {
            for (char p : deps[i].toCharArray()) ES[i] = Math.max(ES[i], EF[p - 'A']);
            EF[i] = ES[i] + dur[i];
            T = Math.max(T, EF[i]);
        }
        // 反向算 LS/LF；浮時 0 為關鍵工作
        for (int i = n - 1; i >= 0; i--) {
            LF[i] = T;
            for (int j = 0; j < n; j++) if (deps[j].indexOf(names[i]) >= 0) LF[i] = Math.min(LF[i], LS[j]);
            LS[i] = LF[i] - dur[i];
        }
        System.out.println("project duration: " + T);
        System.out.println("task dur ES EF LS LF slack");
        StringBuilder crit = new StringBuilder("critical:");
        for (int i = 0; i < n; i++) {
            System.out.printf("%4c %3d %2d %2d %2d %2d %5d%n", names[i], dur[i], ES[i], EF[i], LS[i], LF[i], LS[i] - ES[i]);
            if (LS[i] == ES[i]) crit.append(' ').append(names[i]);
        }
        System.out.println(crit);
    }
}
