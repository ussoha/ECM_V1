"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IProduct } from "@/models/Product";
import LoginModal from "./Components/ModalRequest";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [products, setProducts] = useState<IProduct[]>([]);
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(8);

  const [showLoginModal, setShowLoginModal] = useState(false);

  const applyFilter = () => {
    setPage(1); // reset về trang đầu tiên
    fetchProducts();
  };


useEffect(() => {
  if (status !== "loading") {
    fetchProducts();
  }
}, [status, page]);


  const fetchProducts = async () => {
    const query = new URLSearchParams({
      search,
      min: minPrice || "0",
      max: maxPrice || "1000000000",
      page: page.toString(),
      limit: limit.toString(),
    });

    try {
      const res = await fetch(`/api/products?${query.toString()}`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu");
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Lỗi fetch:", err);
      setProducts([]);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Xoá sản phẩm này?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/authscreen/login" });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">
          🏍️ Danh sách sản phẩm
        </h1>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (!session) {
                setShowLoginModal(true);
              } else {
                router.push("/create");
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow transition"
          >
            + Thêm sản phẩm
          </button>
          {/* <button
            onClick={handleLogout}
            className="bg-gray-300 hover:bg-gray-400 text-black px-5 py-2.5 rounded-lg shadow transition"
          >
            🔓 Đăng xuất
          </button> */}
          {session ? (
            <button
              onClick={() => signOut({ redirect: false })}
              className="bg-gray-300 hover:bg-gray-400 text-black px-5 py-2.5 rounded-lg shadow transition"
            >
              🔓 Đăng xuất
            </button>
          ) : (
            <button
              onClick={() => router.push("/authscreen/login")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow transition"
            >
              🔐 Đăng nhập
            </button>
          )}
        </div>
      </div>

      {/* Filter section */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="🔍 Tìm theo tên"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-md w-full"
        />
        <input
          type="number"
          placeholder="💰 Giá từ"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="border px-4 py-2 rounded-md w-full"
        />
        <input
          type="number"
          placeholder="💸 Giá đến"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="border px-4 py-2 rounded-md w-full"
        />
        <button
          onClick={applyFilter}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md"
        >
          ⚙️ Áp dụng lọc
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {Array.isArray(products) &&
          products.map((p) => (
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
                <button
                  onClick={() => {
                    if (!session) {
                      setShowLoginModal(true);
                    } else {
                      router.push(`/edit/${p._id}`);
                    }
                  }}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-white text-sm py-2 rounded-lg text-center"
                >
                  + Thêm sản phẩm
                </button>
                <button
                  onClick={() => {
                    if (!session) return setShowLoginModal(true);
                    deleteProduct(p._id.toString());
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded-lg"
                >
                  🗑️ Xoá
                </button>
              </div>
            </div>
          ))}
      </div>
      <div className="mt-6 flex justify-center gap-2">
        {total > limit && (
          <div className="flex justify-center mt-8 gap-4">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              ◀ Trang trước
            </button>

            <span className="px-4 py-2 text-gray-700 font-medium">
              Trang {page} / {Math.ceil(total / limit)}
            </span>

            <button
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Trang sau ▶
            </button>
          </div>
        )}
      </div>
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
}
