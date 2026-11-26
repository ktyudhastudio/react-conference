import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-2xl font-semibold">Halaman tidak ditemukan</h1>
      <Link to="/" className="text-primary underline">
        Kembali ke beranda
      </Link>
    </div>
  );
}
