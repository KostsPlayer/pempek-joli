-- Tabel kategori
CREATE TABLE kategori (
    id_kategori INT PRIMARY KEY,
    nama_kategori VARCHAR(255) NOT NULL
);

-- Tabel users
CREATE TABLE users (
    id_pengguna INT PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    alamat TEXT NOT NULL,
    email VARCHAR(255) NOT NULL,
    nomor_telepon VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Tabel alamat pengiriman
CREATE TABLE alamat_pengiriman (
    id_alamat INT PRIMARY KEY,
    id_pengguna INT,
    nama_penerima VARCHAR(255) NOT NULL,
    alamat_lengkap TEXT NOT NULL,
    nomor_telepon VARCHAR(20) NOT NULL,
    FOREIGN KEY (id_pengguna) REFERENCES users(id_pengguna)
);

-- Tabel pesanan
CREATE TABLE pesanan (
    id_pesanan INT PRIMARY KEY,
    id_pengguna INT,
    tanggal_pesanan DATE NOT NULL,
    status_pesanan VARCHAR(50) NOT NULL,
    metode_pembayaran VARCHAR(50) NOT NULL,
    FOREIGN KEY (id_pengguna) REFERENCES users(id_pengguna)
);

-- Tabel detail pesanan
CREATE TABLE detail_pesanan (
    id_detail_pesanan INT PRIMARY KEY,
    id_pesanan INT,
    id_produk INT,
    jumlah INT NOT NULL,
    harga_satuan INT NOT NULL,
    FOREIGN KEY (id_pesanan) REFERENCES pesanan(id_pesanan)
);

-- Tabel pembayaran
CREATE TABLE pembayaran (
    id_pembayaran INT PRIMARY KEY,
    id_pesanan INT,
    tanggal_pembayaran DATE NOT NULL,
    metode_pembayaran VARCHAR(50) NOT NULL,
    bukti_pembayaran VARCHAR(255),
    FOREIGN KEY (id_pesanan) REFERENCES pesanan(id_pesanan)
);

-- Tabel transaksi
CREATE TABLE transaksi (
    id_transaksi INT PRIMARY KEY,
    id_pesanan INT,
    tanggal_transaksi DATE NOT NULL,
    total_bayar INT NOT NULL,
    FOREIGN KEY (id_pesanan) REFERENCES pesanan(id_pesanan)
);

-- Tabel produk
CREATE TABLE produk (
    id_produk INT PRIMARY KEY,
    nama_produk VARCHAR(255) NOT NULL,
    harga INT NOT NULL,
    deskripsi TEXT,
    gambar VARCHAR(255),
    kategori_id INT,
    FOREIGN KEY (kategori_id) REFERENCES kategori(id_kategori)
);
