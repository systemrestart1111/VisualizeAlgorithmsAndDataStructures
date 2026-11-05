public class ConceptProbability {
    record Frac(long n, long d) {
        static Frac of(long a, long b) {
            long x = Math.abs(a), y = Math.abs(b);
            while (y != 0) { long t = x % y; x = y; y = t; }
            if (x == 0) x = 1;
            return new Frac(a / x, b / x);
        }
        Frac add(Frac o) { return of(n * o.d + o.n * d, d * o.d); }
        Frac mul(Frac o) { return of(n * o.n, d * o.d); }
        Frac div(Frac o) { return of(n * o.d, d * o.n); }
        public String toString() { return d == 1 ? "" + n : n + "/" + d; }
    }

    public static void main(String[] args) {
        int red = 3, blue = 2, total = red + blue;
        String[] names = {"RR", "RB", "BR", "BB"};
        for (int replace = 1; replace >= 0; replace--) {
            Frac[] p = new Frac[4];
            for (int f = 0; f < 2; f++) {
                Frac p1 = Frac.of(f == 0 ? red : blue, total);
                int r2 = red, b2 = blue, t2 = total;
                if (replace == 0) { t2--; if (f == 0) r2--; else b2--; }
                for (int s = 0; s < 2; s++) p[f * 2 + s] = p1.mul(Frac.of(s == 0 ? r2 : b2, t2));
            }
            System.out.println(replace == 1 ? "with replacement" : "without replacement");
            for (int i = 0; i < 4; i++) System.out.println("  P(" + names[i] + ") = " + p[i]);
            Frac second = p[0].add(p[2]), cond = p[0].div(p[0].add(p[1]));
            System.out.println("  P(2nd R) = " + second + ", P(2nd R | 1st R) = " + cond + ", independent = " + (second.equals(cond) ? "True" : "False"));
            System.out.println("  E[#red] = " + Frac.of(2, 1).mul(p[0]).add(p[1]).add(p[2]));
        }
    }
}
