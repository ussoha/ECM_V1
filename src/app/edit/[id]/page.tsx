"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/products/${id}`);
      const p = await res.json();
      setForm({
        name: p.name,
        description: p.description,
        price: String(p.price),
        image: p.image || "",
      });
    })();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    await fetch(`/api/products/${id}`, {
      method: "PUT",
      body: formData,
    });

    router.push("/");
    router.refresh();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-md mt-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        ✏️ Cập nhật sản phẩm
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Tên sản phẩm */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Tên sản phẩm
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full border rounded px-4 py-2 focus:ring focus:border-blue-400"
          />
        </div>

        {/* Mô tả */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            rows={4}
            className="w-full border rounded px-4 py-2 focus:ring focus:border-blue-400"
          ></textarea>
        </div>

        {/* Giá */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">Giá</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
            className="w-full border rounded px-4 py-2 focus:ring focus:border-blue-400"
          />
        </div>

        {/* Ảnh sản phẩm */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Ảnh sản phẩm
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setImageFile(file);
            }}
            className="w-full"
          />

          <div className="flex gap-4 mt-3">
            {form.image && !imageFile && (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Ảnh hiện tại</p>
                <img
                  src={form.image}
                  alt="Ảnh sản phẩm"
                  className="w-28 h-28 object-cover rounded border"
                />
              </div>
            )}

            {imageFile && (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Ảnh mới</p>
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Ảnh mới"
                  className="w-28 h-28 object-cover rounded border"
                />
              </div>
            )}
          </div>
        </div>

        {/* Nút cập nhật */}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded transition"
        >
          ✅ Cập nhật sản phẩm
        </button>
      </form>
    </div>
  );
}
