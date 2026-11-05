public class CircularQueueDemo {
    // 固定大小的環狀緩衝區：head、tail 走到陣列尾端就繞回 0，空間可重複使用
    static class CircularQueue {
        Integer[] buf;
        int head = 0, size = 0;

        CircularQueue(int cap) { buf = new Integer[cap]; }

        boolean enqueue(int v) {
            if (size == buf.length) return false; // 已滿
            buf[(head + size) % buf.length] = v;
            size++;
            return true;
        }

        int dequeue() {
            int v = buf[head];
            buf[head] = null;
            head = (head + 1) % buf.length;
            size--;
            return v;
        }

        public String toString() {
            StringBuilder sb = new StringBuilder("buffer [");
            for (int i = 0; i < buf.length; i++) sb.append(i > 0 ? " " : "").append(buf[i] == null ? "." : String.valueOf(buf[i]));
            return sb.append("] head=").append(head).append(" size=").append(size).toString();
        }
    }

    public static void main(String[] args) {
        CircularQueue q = new CircularQueue(5);
        for (int v = 1; v <= 4; v++) q.enqueue(v);
        System.out.println("enqueue 1..4:  " + q);
        int a = q.dequeue(), b = q.dequeue();
        System.out.println("dequeue -> " + a + " " + b + "  " + q);
        for (int v = 5; v <= 7; v++) {
            boolean ok = q.enqueue(v);
            System.out.println("enqueue " + v + ": " + (ok ? "ok  " : "full") + " " + q);
        }
        a = q.dequeue();
        System.out.println("dequeue -> " + a + "  " + q);
    }
}
