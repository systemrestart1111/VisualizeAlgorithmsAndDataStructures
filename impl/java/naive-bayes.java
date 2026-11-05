import java.util.*;

public class NaiveBayes {
    static String[][] TRAIN = {{"spam", "free money now"}, {"spam", "win free prize now"}, {"spam", "claim your free money"}, {"spam", "cheap prize offer"},
                               {"ham", "meeting at noon"}, {"ham", "project meeting notes"}, {"ham", "lunch at noon tomorrow"}, {"ham", "your project report"}};

    // score[c] = log P(c) + Σ log((count + α) / (total + α|V|))；α = 0 時未見過的字得到 −∞
    static double score(String c, String msg, double alpha) {
        Set<String> vocab = new HashSet<>();
        Map<String, Integer> count = new HashMap<>();
        int total = 0, docs = 0;
        for (String[] d : TRAIN) {
            if (d[0].equals(c)) docs++;
            for (String w : d[1].split(" ")) { vocab.add(w); if (d[0].equals(c)) { count.merge(w, 1, Integer::sum); total++; } }
        }
        double s = Math.log((double) docs / TRAIN.length);
        for (String w : msg.split(" ")) {
            double num = count.getOrDefault(w, 0) + alpha;
            if (num == 0) return Double.NEGATIVE_INFINITY;
            s += Math.log(num / (total + alpha * vocab.size()));
        }
        return s;
    }
    static String fmt(double v) { return Double.isInfinite(v) ? "-inf" : String.format("%.3f", v); }

    public static void main(String[] args) {
        for (String msg : new String[]{"free lunch meeting", "win cheap money", "project notes tomorrow", "free coffee now"})
            for (int alpha : new int[]{1, 0}) {
                double sp = score("spam", msg, alpha), hm = score("ham", msg, alpha);
                String pred = Double.isInfinite(sp) && Double.isInfinite(hm) ? "undecidable" : sp >= hm ? "spam" : "ham";
                System.out.println("'" + msg + "', alpha " + alpha + ": spam " + fmt(sp) + ", ham " + fmt(hm) + " -> " + pred);
            }
    }
}
