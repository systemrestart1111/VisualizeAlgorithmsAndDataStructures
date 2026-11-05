public class GradientDescent {
    static double f(double x) { return (x - 2) * (x - 2) + 1; } // 最小值在 x = 2
    static double df(double x) { return 2 * (x - 2); }

    // 沿負梯度方向前進：x ← x − η·f'(x)；η 太大會震盪甚至發散，太小則收斂很慢
    public static void main(String[] args) {
        double x = 5.5, lr = 0.1;
        System.out.println(String.format("step  0: x = %.6f, f(x) = %.6f", x, f(x)));
        for (int step = 1; step <= 20; step++) {
            x -= lr * df(x);
            if (step <= 5 || step % 5 == 0) System.out.println(String.format("step %2d: x = %.6f, f(x) = %.6f", step, x, f(x)));
        }
    }
}
