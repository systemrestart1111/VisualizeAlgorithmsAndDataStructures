public class FFT {
    // 迭代版 Cooley–Tukey：先做位元反轉排列，再由長度 2、4、8… 逐層做蝴蝶運算，O(n log n)
    // 以 re[]、im[] 兩個陣列表示複數
    static void fft(double[] re, double[] im, boolean invert) {
        int n = re.length;
        for (int i = 1, j = 0; i < n; i++) { // 位元反轉
            int bit = n >> 1;
            for (; (j & bit) != 0; bit >>= 1) j ^= bit;
            j |= bit;
            if (i < j) {
                double t = re[i]; re[i] = re[j]; re[j] = t;
                t = im[i]; im[i] = im[j]; im[j] = t;
            }
        }
        for (int len = 2; len <= n; len <<= 1) {
            double ang = 2 * Math.PI / len * (invert ? 1 : -1), wr = Math.cos(ang), wi = Math.sin(ang);
            for (int i = 0; i < n; i += len) {
                double cr = 1, ci = 0;
                for (int k = 0; k < len / 2; k++) {
                    int p = i + k, q = i + k + len / 2;
                    double vr = re[q] * cr - im[q] * ci, vi = re[q] * ci + im[q] * cr;
                    re[q] = re[p] - vr; im[q] = im[p] - vi;
                    re[p] += vr; im[p] += vi;
                    double nr = cr * wr - ci * wi;
                    ci = cr * wi + ci * wr;
                    cr = nr;
                }
            }
        }
        if (invert)
            for (int i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
    }

    // 在「點值表示」下多項式相乘只需逐點相乘：FFT → 相乘 → 逆 FFT
    public static void main(String[] args) {
        int[] A = {1, 2, 3}, B = {4, 5, 6}; // 係數由低次到高次
        int n = 1;
        while (n < A.length + B.length - 1) n <<= 1;
        double[] ar = new double[n], ai = new double[n], br = new double[n], bi = new double[n];
        for (int i = 0; i < A.length; i++) ar[i] = A[i];
        for (int i = 0; i < B.length; i++) br[i] = B[i];
        fft(ar, ai, false);
        fft(br, bi, false);
        for (int i = 0; i < n; i++) {
            double r = ar[i] * br[i] - ai[i] * bi[i];
            ai[i] = ar[i] * bi[i] + ai[i] * br[i];
            ar[i] = r;
        }
        fft(ar, ai, true);
        StringBuilder sb = new StringBuilder("A x B =");
        for (int i = 0; i < A.length + B.length - 1; i++) sb.append(' ').append(Math.round(ar[i]));
        System.out.println(sb);
    }
}
