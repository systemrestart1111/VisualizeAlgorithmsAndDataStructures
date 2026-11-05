import java.util.function.DoubleUnaryOperator;

public class SecantMethod {
    // x2 = x1 − f(x1)(x1 − x0) / (f(x1) − f(x0))；分母趨近 0 或 |x| 爆增時停止
    static String secant(DoubleUnaryOperator f, double x0, double x1) {
        for (int k = 1; k <= 25; k++) {
            double f0 = f.applyAsDouble(x0), f1 = f.applyAsDouble(x1);
            if (Math.abs(f1 - f0) < 1e-14) return "flat secant (f(x0) = f(x1)), stop";
            double x2 = x1 - f1 * (x1 - x0) / (f1 - f0);
            if (!Double.isFinite(x2) || Math.abs(x2) > 1e6) return "diverged after " + k + " steps";
            if (Math.abs(x2 - x1) < 1e-12) return String.format("root %.10f after %d steps", Math.abs(x2) < 5e-11 ? 0.0 : x2, k);
            x0 = x1; x1 = x2;
        }
        return "no convergence in 25 steps";
    }

    public static void main(String[] args) {
        DoubleUnaryOperator cubic = x -> x * x * x - 2 * x - 5, cs = x -> Math.cos(x) - x, sq = x -> x * x - 2, at = Math::atan;
        System.out.println("x^3-2x-5, x0 = 1, x1 = 3: " + secant(cubic, 1, 3));
        System.out.println("cos x - x, x0 = 0, x1 = 1: " + secant(cs, 0, 1));
        System.out.println("x^2-2, x0 = 1, x1 = 2: " + secant(sq, 1, 2));
        System.out.println("x^2-2, x0 = -1, x1 = 1: " + secant(sq, -1, 1));
        System.out.println("atan x, x0 = 1, x1 = 2: " + secant(at, 1, 2));
        System.out.println("atan x, x0 = 3, x1 = 5: " + secant(at, 3, 5));
    }
}
