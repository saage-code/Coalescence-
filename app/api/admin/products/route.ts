import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getProducts, newId, saveProducts, type Product } from "@/lib/db";

function sanitize(input: Record<string, unknown>, existing?: Product): Product {
  const str = (key: keyof Product, max = 300) =>
    typeof input[key] === "string" ? (input[key] as string).trim().slice(0, max) : existing?.[key] ?? "";
  return {
    id: existing?.id ?? newId(),
    name: str("name") as string,
    price: str("price", 50) as string,
    image: str("image", 500) as string,
    tag: str("tag", 40) as string,
    buyUrl: str("buyUrl", 500) as string,
    soldOut: "soldOut" in input ? Boolean(input.soldOut) : existing?.soldOut ?? false,
  };
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(getProducts());
}

// POST { action: "create" | "update" | "delete" | "move", product?, id?, direction? }
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    action?: string;
    product?: Record<string, unknown>;
    id?: string;
    direction?: "up" | "down";
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const products = getProducts();

  if (body.action === "create") {
    const product = sanitize(body.product ?? {});
    if (!product.name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
    products.push(product);
    saveProducts(products);
    return NextResponse.json(products);
  }

  const index = products.findIndex((p) => p.id === body.id);
  if (index === -1) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  if (body.action === "update") {
    products[index] = sanitize(body.product ?? {}, products[index]);
    if (!products[index].name)
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
  } else if (body.action === "delete") {
    products.splice(index, 1);
  } else if (body.action === "move") {
    const target = body.direction === "up" ? index - 1 : index + 1;
    if (target >= 0 && target < products.length) {
      [products[index], products[target]] = [products[target], products[index]];
    }
  } else {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  saveProducts(products);
  return NextResponse.json(products);
}
