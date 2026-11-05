public class NewtonMethod {
    static double f(double x) { return x * x * x - 2 * x - 5; }
    static double df(double x) { return 3 * x * x - 2; }

    // 用切線逼近：x ← x − f(x) / f'(x)；靠近根時誤差每步大約平方縮小（二次收斂）
    public static void main(String[] args) {
        double x = 3;
        System.out.println(String.format("x0 = %.10f", x));
        for (int i = 1; i <= 6; i++) {
            x -= f(x) / df(x);
            System.out.println(String.format("x%d = %.10f", i, x));
        }
    }
}
