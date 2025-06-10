import { notFound } from "next/navigation";
import Product, { IProduct } from "@/models/Product";
import { dbConnect } from "@/lib/db";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  await dbConnect();

  const product = (await Product.findById(id).lean()) as IProduct | null;
  if (!product) return notFound();

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Hình ảnh sản phẩm */}
        {product.image && (
          <div className="w-full rounded-lg overflow-hidden shadow-md">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-[400px] object-cover"
            />
          </div>
        )}

        {/* Thông tin sản phẩm */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-gray-800">{product.name}</h1>

          <p className="text-gray-600 leading-relaxed text-lg">
            {product.description}
          </p>

          <div className="text-green-700 font-extrabold text-3xl">
            {Number(product.price).toLocaleString()}₫
          </div>

          {/* Các nút hành động (nếu cần) */}
          <div className="flex gap-4 pt-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition text-sm font-medium">
              Mua ngay
            </button>
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-md transition text-sm font-medium">
              Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
