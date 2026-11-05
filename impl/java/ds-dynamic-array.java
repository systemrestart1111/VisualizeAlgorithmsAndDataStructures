public class DynamicArrayDemo {
    // 容量滿時加倍、只剩 1/4 時減半；搬移成本攤銷後，每次 append / pop 平均 O(1)
    static class DynamicArray {
        int[] data = new int[1];
        int size = 0;

        void resize(int cap) { data = java.util.Arrays.copyOf(data, cap); }

        void append(int v) {
            if (size == data.length) resize(data.length * 2);
            data[size++] = v;
        }

        int pop() {
            int v = data[--size];
            if (data.length > 1 && size <= data.length / 4) resize(data.length / 2);
            return v;
        }

        public String toString() {
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < size; i++) sb.append(i > 0 ? " " : "").append(data[i]);
            return sb.append("] size=").append(size).append(" cap=").append(data.length).toString();
        }
    }

    public static void main(String[] args) {
        DynamicArray a = new DynamicArray();
        for (int v : new int[] {10, 20, 30, 40, 50}) { a.append(v); System.out.println("append " + v + ": " + a); }
        for (int i = 0; i < 4; i++) { int v = a.pop(); System.out.println("pop -> " + v + ": " + a); }
    }
}
