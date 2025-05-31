# 🎨 Grafika Komputer - Object Painter 🖌️

Selamat datang di **Object Painter**! Aplikasi web interaktif yang memungkinkan Anda untuk menuangkan kreativitas dengan menggambar dan memanipulasi objek 2D dan 3D. Proyek ini merupakan implementasi konsep-konsep grafika komputer dasar dalam antarmuka yang ramah pengguna.

<a href="https://grafika-projek-akhir-object-painter-8am9.vercel.app/">Link Website</a>

![image](https://github.com/user-attachments/assets/0091308c-c567-4f4c-b1fa-a1b554c96de0)

## 🌟 Fitur Utama

### Halaman Awal Dinamis:
* 🎨 **Pilihan Mode Editor**: Pengguna disambut dengan halaman awal yang menarik secara visual, menawarkan pilihan untuk masuk ke mode editor 2D atau 3D.
* ✨ **Animasi Menarik**: Latar belakang gradien animasi dan efek partikel untuk pengalaman pengguna yang lebih hidup.

### Editor 2D Komprehensif (`2D/2d.html`):
* ✏️ **Menggambar Bentuk Kustom**:
    * ✝️ Cross (Salib)
    * ☪️ Bulan Bintang
    * ☯️ Yin Yang
* 🖌️ **Alat Menggambar & Edit**:
    * **Brush**: Untuk menggambar goresan bebas dengan ukuran dan warna yang dapat disesuaikan.
    * **Eraser**: Menghapus bagian dari kanvas atau objek.
    * **Select Tool**: Memilih objek untuk dimanipulasi.
* 🎨 **Opsi Warna & Garis Fleksibel**:
    * **Warna Isi (Fill Color)**: Pilih warna untuk mengisi bagian dalam objek. Opsi untuk mengaktifkan/menonaktifkan isi.
    * **Warna Garis Tepi (Stroke Color)**: Tentukan warna untuk garis tepi objek. Opsi untuk mengaktifkan/menonaktifkan garis tepi.
    * **Lebar Garis (Stroke Width)**: Sesuaikan ketebalan garis tepi.
    * **Properti Per Objek**: Setiap objek menyimpan properti warna dan garisnya sendiri. Toolbar akan merefleksikan properti objek yang dipilih, atau properti default jika tidak ada yang dipilih.
* 🔄 **Transformasi Objek Terpilih**:
    * **Translasi (Geser)**: Pindahkan objek ke posisi baru.
    * **Skala (Ubah Ukuran)**: Perbesar atau perkecil objek.
    * **Rotasi (Putar)**: Putar objek mengelilingi titik tengahnya.
    * **Metode Input Transformasi**:
        * 🖱️ **Mouse**: Manipulasi langsung menggunakan handle seleksi (translasi, skala, rotasi).
        * ⌨️ **Keyboard**: Gunakan tombol panah (translasi), `+`/`-` (skala), `R`/`T` (rotasi).
        * 📝 **Form**: Masukkan nilai numerik presisi untuk transformasi.
* 🖼️ **Manajemen Kanvas**:
    * **Clear Canvas**: Bersihkan seluruh area gambar.
    * **Save As Image**: Simpan hasil karya Anda sebagai file PNG.
* 🗑️ **Hapus Objek**: Hapus objek yang dipilih menggunakan tombol `Delete` atau `Backspace` pada keyboard (dengan konfirmasi).
* ✨ **Antarmuka Pengguna Responsif**: Toolbar yang terorganisir dan area kanvas yang luas, dirancang untuk kemudahan penggunaan.
* 💬 **Notifikasi Pengguna**: Pesan umpan balik untuk berbagai aksi (misalnya, objek disimpan, kanvas dibersihkan).

### Editor 3D Komprehensif (`3D/3d.html`):
* 🧊 **Membuat Objek 3D Kustom**:
    * 🏺 Vas (menggunakan LatheGeometry)
    * 💊 Kapsul (gabungan silinder dan setengah bola)
    * 🕌 Kubah Masjid (setengah bola)
* 🛠️ **Alat Seleksi & Transformasi**:
    * **Select / Transform Tool**: Memilih objek 3D untuk dimanipulasi menggunakan gizmo.
* 🎨 **Opsi Material & Garis Tepi**:
    * **Warna Isi (Fill Color)**: Pilih warna dasar material objek. Opsi untuk mengaktifkan/menonaktifkan visibilitas material.
    * **Warna Garis Tepi (Stroke Color)**: Tentukan warna untuk garis tepi (edges) objek. Opsi untuk mengaktifkan/menonaktifkan garis tepi.
    * **Lebar Garis (Stroke Width)**: Sesuaikan ketebalan garis tepi.
    * **Properti Per Objek**: Setiap objek 3D dapat memiliki material dan properti garis tepi yang unik.
* 🔄 **Transformasi Objek 3D Terpilih**:
    * **Translasi (Geser)**: Pindahkan objek pada sumbu X, Y, dan Z.
    * **Skala (Ubah Ukuran)**: Perbesar atau perkecil objek pada sumbu X, Y, dan Z.
    * **Rotasi (Putar)**: Putar objek mengelilingi sumbu X, Y, dan Z.
    * **Metode Input Transformasi**:
        * 🖱️ **Mouse (Gizmo)**: Manipulasi langsung menggunakan gizmo TransformControls dari Three.js.
        * ⌨️ **Keyboard**: Gunakan tombol panah (translasi X/Y), PageUp/Down (translasi Z), `S`/`Ctrl+S` (skala), `R`/`F` (rotasi Y), `T`/`G` (rotasi X), `Y`/`H` (rotasi Z).
        * 📝 **Form**: Masukkan nilai numerik presisi untuk transformasi pada sumbu X, Y, Z.
* 🌌 **Manajemen Scene 3D**:
    * **Clear Canvas**: Bersihkan semua objek dari scene 3D.
    * **Save As Image**: Simpan tampilan scene 3D saat ini sebagai file PNG.
    * **Kontrol Kamera**: OrbitControls untuk navigasi kamera (zoom, pan, rotate).
* 🗑️ **Hapus Objek**: Hapus objek 3D yang dipilih menggunakan tombol `Delete` atau `Backspace` pada keyboard.
* 💡 **Petunjuk Penggunaan**: Panel bantuan untuk menampilkan shortcut keyboard.
* 💬 **Notifikasi Pengguna**: Pesan umpan balik untuk berbagai aksi.

## 🛠️ Teknologi yang Digunakan

* **Frontend**:
    * HTML5
    * CSS3 (termasuk custom styling dan animasi)
    * JavaScript (ES6+)
    * **Three.js**: Untuk rendering dan manipulasi grafika 3D.
        * OrbitControls (untuk navigasi kamera 3D)
        * TransformControls (untuk gizmo manipulasi objek 3D)
* **Styling Framework (Halaman Awal)**:
    * Tailwind CSS
* **Font**:
    * Inter (dari Google Fonts)

## 📁 Struktur File

├── index.html                 # Halaman awal pilihan editor <br>
├── style.css                  # CSS untuk halaman awal <br>
├── script.js                  # JavaScript untuk halaman awal <br>
├── 2D/ <br>
│   ├── 2d.html                # File HTML untuk Editor 2D <br>
│   ├── 2d.css                 # File CSS untuk Editor 2D <br>
│   └── 2d.js                  # File JavaScript untuk Editor 2D <br>
├── 3D/ <br>
│   ├── 3d.html                # File HTML untuk Editor 3D <br>
│   ├── 3d.css                 # File CSS untuk Editor 3D <br>
│   └── 3d.js                  # File JavaScript untuk Editor 3D <br>
└── README.md                  # File yang sedang Anda baca <br>


## 🚀 Cara Menjalankan Proyek

1.  **Clone repository ini (jika belum):**
    ```bash
    git clone https://github.com/Shinta505/Grafika-Projek-Akhir---Object-Painter.git <nama folder>
    ```
2.  **Buka direktori proyek:**
    ```bash
    cd <nama folder>
    ```
3.  **Buka file `index.html` di browser web pilihan Anda.**
    * Anda dapat melakukannya dengan mengklik dua kali file tersebut di file explorer Anda.
4.  Dari halaman awal, pilih "🎨 Editor 2D" atau "🧊 Editor 3D" untuk mulai menggunakan aplikasi.

## 💡 Cara Menggunakan Editor 2D

1.  **Memilih Alat**: Gunakan tombol-tombol di bagian "Alat" atau "Bentuk Kustom" pada toolbar untuk memilih aksi yang ingin dilakukan (misalnya, Select, Brush, Cross).
2.  **Menggambar Bentuk**:
    * Pilih salah satu bentuk kustom (Cross, Bulan Bintang, Yin Yang).
    * Klik dan seret pada kanvas untuk menentukan ukuran dan posisi bentuk. Bentuk akan dibuat dengan properti warna dan garis default saat ini.
3.  **Menggunakan Brush/Eraser**:
    * Pilih alat Brush atau Eraser.
    * Sesuaikan "Ukuran Brush/Eraser" dan "Warna Brush" (untuk Brush).
    * Klik dan seret pada kanvas.
4.  **Mengubah Warna & Garis**:
    * **Untuk Objek Baru**: Jika tidak ada objek yang dipilih, atur properti di bagian "Opsi Warna & Garis" di toolbar. Pengaturan ini akan menjadi default untuk objek berikutnya.
    * **Untuk Objek Terpilih**: Pilih objek menggunakan alat "Select". Toolbar akan menampilkan properti objek tersebut. Ubah nilai pada kontrol warna/garis untuk memodifikasi objek yang dipilih.
5.  **Memilih & Memanipulasi Objek**:
    * Gunakan alat "Select".
    * Klik pada objek di kanvas untuk memilihnya.
    * Setelah objek dipilih, Anda dapat:
        * **Mengubah Warna/Garis**: Seperti dijelaskan di atas.
        * **Transformasi**: Pilih metode transformasi (Mouse, Keyboard, Form) di toolbar.
            * **Mouse**: Seret objek untuk translasi. Gunakan handle yang muncul di sekitar objek untuk skala dan rotasi.
            * **Keyboard**: Gunakan tombol pintas yang dijelaskan saat mode keyboard aktif.
            * **Form**: Masukkan nilai numerik pada input yang muncul dan klik "Apply".
6.  **Menghapus Objek**: Pilih objek, lalu tekan tombol `Delete` atau `Backspace` pada keyboard. Konfirmasi penghapusan.
7.  **Menyimpan & Membersihkan**:
    * Gunakan tombol "Save As Image" untuk mengunduh gambar Anda.
    * Gunakan tombol "Clear Canvas" untuk membersihkan semua objek (dengan konfirmasi).

## 💡 Cara Menggunakan Editor 3D

1.  **Membuat Objek**: Klik tombol bentuk 3D (Vas, Kapsul, Kubah Masjid) di toolbar. Objek akan muncul di tengah scene.
2.  **Navigasi Kamera**:
    * **Orbit (Putar Kamera)**: Klik kiri dan seret pada area kanvas.
    * **Zoom**: Scroll mouse wheel.
    * **Pan (Geser Kamera)**: Klik kanan (atau tengah, tergantung konfigurasi OrbitControls) dan seret.
3.  **Memilih Objek**:
    * Pastikan alat "Select / Transform" aktif.
    * Klik pada objek di scene 3D untuk memilihnya. Gizmo transformasi akan muncul.
4.  **Mengubah Material & Garis Tepi**:
    * Setelah objek dipilih, gunakan kontrol di bagian "Opsi Material" pada toolbar untuk mengubah warna isi, mengaktifkan/menonaktifkan visibilitas, warna garis tepi, dan lebar garis tepi.
5.  **Transformasi Objek**:
    * Pilih metode transformasi (Mouse (Gizmo), Keyboard, Form) di toolbar.
        * **Mouse (Gizmo)**: Klik dan seret sumbu atau kontrol pada gizmo yang muncul pada objek terpilih untuk translasi, rotasi, atau skala.
        * **Keyboard**: Gunakan tombol pintas (lihat bagian "Petunjuk Penggunaan" di aplikasi untuk daftar lengkap). Contoh: Panah untuk translasi X/Y, PageUp/Down untuk translasi Z.
        * **Form**: Masukkan nilai numerik pada input X, Y, Z untuk Translate, Scale, atau Rotate, lalu klik tombol "Apply" yang sesuai.
6.  **Menghapus Objek**: Pilih objek, lalu tekan tombol `Delete` atau `Backspace` pada keyboard.
7.  **Menyimpan & Membersihkan**:
    * Gunakan tombol "Save As Image" untuk mengunduh tampilan scene saat ini.
    * Gunakan tombol "Clear Canvas" untuk menghapus semua objek dari scene.
8.  **Petunjuk**: Klik tombol "Petunjuk Penggunaan" untuk melihat daftar shortcut keyboard.

## 🧑‍💻 Tim Pengembang

Proyek ini dikembangkan oleh:
* **Shinta Nursobah Chairani / 123220074**
* **Veyza Pradita Ardhia Putri / 123220102**
* **Rolly Dhea Venesia Sibuea / 123220134**

Terima kasih telah mengunjungi proyek kami! Kami harap Anda menikmati menggunakan Editor Grafika Kreatif ini. Jangan ragu untuk memberikan masukan atau kontribusi.
