public class RandomWalk {
    static long state = 42;

    // Park–Miller 亂數產生器（五種語言結果相同），回傳 0..k-1
    static int randInt(int k) {
        state = state * 48271 % 2147483647;
        return (int) (state % k);
    }

    // 二維隨機漫步：每步等機率往上下左右走一格；n 步後離原點的距離期望值約為 √n
    public static void main(String[] args) {
        int[] DX = {1, 0, -1, 0}, DY = {0, 1, 0, -1};
        long x = 0, y = 0, far = 0;
        for (int step = 1; step <= 400; step++) {
            int d = randInt(4);
            x += DX[d];
            y += DY[d];
            far = Math.max(far, x * x + y * y);
            if (step == 100 || step == 200 || step == 400)
                System.out.println(String.format("step %d: position (%d, %d), distance = %.4f", step, x, y, Math.sqrt(x * x + y * y)));
        }
        System.out.println(String.format("farthest distance = %.4f, sqrt(n) = %.4f", Math.sqrt(far), Math.sqrt(400)));
    }
}
