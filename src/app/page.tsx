"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IProduct } from "@/models/Product";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<IProduct[]>([]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/authscreen/login");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session) {
      fetchProducts();
    }
  }, [session]);

  const fetchProducts = async () => {
    const res = await fetch("/api/products", { cache: "no-store" });
    setProducts(await res.json());
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Xoá sản phẩm này?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleLogout = () => {
    signOut({ callbackUrl: "/authscreen/login" });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">
          🛍️ Danh sách sản phẩm
        </h1>

        <div className="flex items-center gap-4">
          <Link
            href="/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow transition"
          >
            + Thêm sản phẩm
          </Link>
          <button
            onClick={handleLogout}
            className="bg-gray-300 hover:bg-gray-400 text-black px-5 py-2.5 rounded-lg shadow transition"
          >
            🔓 Đăng xuất
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((p) => (
          <div
            key={p._id.toString()}
            className="bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden flex flex-col justify-between"
          >
            <Link href={`/products/${p._id}`} className="block">
              {p.image && (
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-48 object-cover rounded-t-2xl"
                />
              )}
              <div className="p-4 space-y-2">
                <h2 className="text-lg font-semibold text-gray-800 truncate">
                  {p.name}
                </h2>
                <p className="text-gray-500 text-sm line-clamp-2 h-[2.5em]">
                  {p.description}
                </p>
                <p className="text-xl font-bold text-green-600">
                  {Number(p.price).toLocaleString()}₫
                </p>
              </div>
            </Link>

            <div className="flex justify-between px-4 pb-4 gap-2">
              <Link
                href={`/edit/${p._id}`}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-white text-sm py-2 rounded-lg text-center"
              >
                ✏️ Sửa
              </Link>
              <button
                onClick={() => deleteProduct(p._id.toString())}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded-lg"
              >
                🗑️ Xoá
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
