public class RungeKutta4 {
    interface Fn { double f(double t, double y); }

    // 每步四個斜率：起點、兩個中點、終點，以 1:2:2:1 加權
    static double rk4(Fn f, double y0, double h, double T) {
        double t = 0, y = y0;
        int n = (int) Math.round(T / h);
        for (int k = 0; k < n; k++) {
            double k1 = f.f(t, y), k2 = f.f(t + h / 2, y + h * k1 / 2), k3 = f.f(t + h / 2, y + h * k2 / 2), k4 = f.f(t + h, y + h * k3);
            y += h * (k1 + 2 * k2 + 2 * k3 + k4) / 6;
            t = (k + 1) * h;
        }
        return y;
    }
    static double euler(Fn f, double y0, double h, double T) {
        double t = 0, y = y0;
        int n = (int) Math.round(T / h);
        for (int k = 0; k < n; k++) { y += h * f.f(t, y); t = (k + 1) * h; }
        return y;
    }
    static String g(double v) { return v == Math.rint(v) ? String.valueOf((long) v) : String.valueOf(v); }

    public static void main(String[] args) {
        String[] names = {"y' = y, y(0) = 1", "y' = -2ty, y(0) = 1", "y' = t - y, y(0) = 1"};
        Fn[] fs = {(t, y) -> y, (t, y) -> -2 * t * y, (t, y) -> t - y};
        double[] Ts = {2, 2, 3}, ex = {Math.exp(2), Math.exp(-4), 3 - 1 + 2 * Math.exp(-3)};
        for (int i = 0; i < 3; i++) {
            for (double h : new double[]{0.5, 0.25, 0.1}) {
                double y = rk4(fs[i], 1.0, h, Ts[i]), ye = euler(fs[i], 1.0, h, Ts[i]);
                System.out.println(String.format("%s, h = %s: y(%s) rk4 %.8f (err %.8f), euler %.8f (err %.8f)", names[i], g(h), g(Ts[i]), y, Math.abs(y - ex[i]), ye, Math.abs(ye - ex[i])));
            }
            double e1 = Math.abs(rk4(fs[i], 1.0, 0.2, Ts[i]) - ex[i]), e2 = Math.abs(rk4(fs[i], 1.0, 0.1, Ts[i]) - ex[i]);
            System.out.println(String.format("  halving h from 0.2 to 0.1 shrinks rk4 error by %.1fx", e1 / e2));
        }
    }
}
