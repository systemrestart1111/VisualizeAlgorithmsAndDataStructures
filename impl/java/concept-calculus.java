public class ConceptCalculus {
    static double f(double x) { return x * x; }
    static double df(double x) { return 2 * x; }
    static double g(double x, double y) { return x * x + 2 * y * y; }

    public static void main(String[] args) {
        double x0 = 1.0, h = 1.0;
        System.out.printf("exact f'(%.1f) = %.6f%n", x0, df(x0));
        for (int i = 0; i < 6; i++, h /= 2) {
            double forward = (f(x0 + h) - f(x0)) / h;
            double central = (f(x0 + h) - f(x0 - h)) / (2 * h);
            System.out.printf("h = %.5f  forward = %.6f  central = %.6f  error = %.6f%n", h, forward, central, Math.abs(forward - df(x0)));
        }
        double eps = 1e-3;
        System.out.printf("grad g(1,1) analytic = (2.000, 4.000), numeric = (%.3f, %.3f)%n", (g(1 + eps, 1) - g(1 - eps, 1)) / (2 * eps), (g(1, 1 + eps) - g(1, 1 - eps)) / (2 * eps));
    }
}
