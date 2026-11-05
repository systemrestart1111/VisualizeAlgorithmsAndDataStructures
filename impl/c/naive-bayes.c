#include <math.h>
#include <stdio.h>
#include <string.h>

static const char *TRAIN[8][2] = {{"spam", "free money now"}, {"spam", "win free prize now"}, {"spam", "claim your free money"}, {"spam", "cheap prize offer"},
                                  {"ham", "meeting at noon"}, {"ham", "project meeting notes"}, {"ham", "lunch at noon tomorrow"}, {"ham", "your project report"}};
static char vocab[64][16];
static int nv, cnt[2][64], tot[2];

static int idx(const char *w) { for (int i = 0; i < nv; i++) if (!strcmp(vocab[i], w)) return i; return -1; }
static void train(void) {
    for (int d = 0; d < 8; d++) {
        char buf[64];
        strcpy(buf, TRAIN[d][1]);
        int c = TRAIN[d][0][0] == 's' ? 0 : 1;
        for (char *w = strtok(buf, " "); w; w = strtok(NULL, " ")) {
            int i = idx(w);
            if (i < 0) { strcpy(vocab[nv], w); i = nv++; }
            cnt[c][i]++;
            tot[c]++;
        }
    }
}
/* score[c] = log P(c) + Σ log((count + α) / (total + α|V|))；α = 0 時未見過的字得到 −∞ */
static double score(int c, const char *msg, double alpha) {
    double s = log(4.0 / 8);
    char buf[64];
    strcpy(buf, msg);
    for (char *w = strtok(buf, " "); w; w = strtok(NULL, " ")) {
        int i = idx(w);
        double num = (i >= 0 ? cnt[c][i] : 0) + alpha;
        if (num == 0) return -INFINITY;
        s += log(num / (tot[c] + alpha * nv));
    }
    return s;
}
static void fmt(double v, char *out) { if (isinf(v)) strcpy(out, "-inf"); else sprintf(out, "%.3f", v); }

int main(void) {
    train();
    const char *msgs[4] = {"free lunch meeting", "win cheap money", "project notes tomorrow", "free coffee now"};
    for (int m = 0; m < 4; m++)
        for (int a = 1; a >= 0; a--) {
            double sp = score(0, msgs[m], a), hm = score(1, msgs[m], a);
            char s1[32], s2[32];
            fmt(sp, s1); fmt(hm, s2);
            const char *pred = isinf(sp) && isinf(hm) ? "undecidable" : sp >= hm ? "spam" : "ham";
            printf("'%s', alpha %d: spam %s, ham %s -> %s\n", msgs[m], a, s1, s2, pred);
        }
    return 0;
}
