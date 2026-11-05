import java.util.function.DoubleUnaryOperator;

public class SimpsonRule {
    // 係數 1, 4, 2, 4, …, 2, 4, 1 乘 h/3；n 必須是偶數（奇數回傳 NaN）
    static double simpson(DoubleUnaryOperator f, double a, double b, int n) {
        if (n % 2 != 0) return Double.NaN;
        double h = (b - a) / n, s = f.applyAsDouble(a) + f.applyAsDouble(b);
        for (int i = 1; i < n; i++) s += (i % 2 == 1 ? 4 : 2) * f.applyAsDouble(a + i * h);
        return s * h / 3;
    }
    static double trapezoid(DoubleUnaryOperator f, double a, double b, int n) {
        double h = (b - a) / n, s = 0;
        for (int i = 1; i < n; i++) s += f.applyAsDouble(a + i * h);
        return (f.applyAsDouble(a) + f.applyAsDouble(b)) / 2 * h + s * h;
    }

    public static void main(String[] args) {
        String[] names = {"sin x on [0, pi]", "4/(1+x^2) on [0, 1]", "x^3-2x+1 on [0, 2]", "sqrt x on [0, 1]"};
        DoubleUnaryOperator[] fs = {Math::sin, x -> 4 / (1 + x * x), x -> x * x * x - 2 * x + 1, Math::sqrt};
        double[] as = {0, 0, 0, 0}, bs = {Math.PI, 1, 2, 1}, ex = {2.0, Math.PI, 2.0, 2.0 / 3};
        for (int t = 0; t < 4; t++)
            for (int n : new int[]{2, 6, 12, 24}) {
                double s = simpson(fs[t], as[t], bs[t], n);
                System.out.println(String.format("%s, n = %d: simpson %.10f (err %.10f), trapezoid err %.10f", names[t], n, s, Math.abs(s - ex[t]), Math.abs(trapezoid(fs[t], as[t], bs[t], n) - ex[t])));
            }
        System.out.println("n = 5: " + (Double.isNaN(simpson(Math::sin, 0, 1, 5)) ? "n must be even" : "ok"));
    }
}
