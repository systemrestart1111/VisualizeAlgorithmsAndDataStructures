public class FisherYates {
    static long state = 42;

    // Park–Miller 亂數產生器（五種語言結果相同），回傳 0..k-1
    static int randInt(int k) {
        state = state * 48271 % 2147483647;
        return (int) (state % k);
    }

    public static void main(String[] args) {
        int[] a = new int[12];
        for (int i = 0; i < a.length; i++) a[i] = i + 1;
        // 由後往前，每個位置 i 與 0..i 中隨機一格交換；每種排列出現的機率都是 1/n!
        for (int i = a.length - 1; i > 0; i--) {
            int j = randInt(i + 1), t = a[i];
            a[i] = a[j];
            a[j] = t;
        }
        StringBuilder sb = new StringBuilder("shuffled:");
        for (int x : a) sb.append(' ').append(x);
        System.out.println(sb);
    }
}
