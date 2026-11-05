public class FixedArrayDemo {
    // 固定容量的陣列：隨機存取 O(1)；在中間插入或刪除需要搬移後面的元素 O(n)
    static class FixedArray {
        int[] data;
        int size = 0;

        FixedArray(int capacity) { data = new int[capacity]; }

        void insert(int i, int v) {
            if (size == data.length) throw new IllegalStateException("array is full");
            for (int k = size; k > i; k--) data[k] = data[k - 1]; // i 之後的元素整段右移
            data[i] = v;
            size++;
        }

        int delete(int i) {
            int v = data[i];
            for (int k = i; k < size - 1; k++) data[k] = data[k + 1]; // i 之後的元素整段左移
            size--;
            return v;
        }

        int search(int v) {
            for (int i = 0; i < size; i++) if (data[i] == v) return i;
            return -1;
        }

        public String toString() {
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < size; i++) sb.append(i > 0 ? " " : "").append(data[i]);
            return sb.append("] size=").append(size).append('/').append(data.length).toString();
        }
    }

    public static void main(String[] args) {
        FixedArray a = new FixedArray(8);
        int[] init = {5, 3, 8, 1};
        for (int i = 0; i < 4; i++) a.insert(i, init[i]);
        System.out.println("init:       " + a);
        a.insert(2, 42); System.out.println("insert(2,42): " + a);
        a.data[0] = 7; System.out.println("set a[0]=7:   " + a);
        int v = a.delete(1);
        System.out.println("delete(1) -> " + v + " " + a);
        System.out.println("search(8) -> " + a.search(8));
    }
}
