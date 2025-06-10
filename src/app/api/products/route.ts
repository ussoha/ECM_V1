import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";
import formidable, { Fields, Files } from "formidable";
import { toNodeReadable } from "@/lib/toNodeReadable";
import cloudinary from "@/lib/cloudinary"; // THÊM DÒNG NÀY

export const config = {
  api: {
    bodyParser: false, // BẮT BUỘC khi dùng formidable
  },
};

export async function GET() {
  await dbConnect();
  try {
    const products = await Product.find({});
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ message: "Lỗi server", error }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();

  const form = formidable({
    keepExtensions: true,
    maxFiles: 1,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowEmptyFiles: false,
  });

  const stream = toNodeReadable(req);

  const { fields, files }: { fields: Fields; files: Files } = await new Promise(
    (res, rej) => {
      form.parse(stream as any, (err, flds, fls) =>
        err ? rej(err) : res({ fields: flds, files: fls })
      );
    }
  );

  let imageUrl = "";
  if (files.image) {
    const file = Array.isArray(files.image) ? files.image[0] : files.image;

    const uploadResult = await cloudinary.uploader.upload(file.filepath, {
      folder: "products",
    });

    imageUrl = uploadResult.secure_url;
  }

  try {
    const product = new Product({
      name: fields.name?.[0],
      description: fields.description?.[0],
      price: Number(fields.price?.[0]),
      image: imageUrl,
    });
    await product.save();
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi server", error }, { status: 500 });
  }
}
