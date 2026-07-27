import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { RetailerSale } from "@/models/RetailerSale";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectDB();

    const sales = await RetailerSale.find({ user: userId }).sort({ createdAt: -1 });

    return NextResponse.json({ sales });
  } catch (error: any) {
    console.error("GET RetailerSales error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve sales transactions." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();

    await connectDB();

    // Check uniqueness of invoice number
    const existingInvoice = await RetailerSale.findOne({ invoiceNumber: body.invoiceNumber });
    if (existingInvoice) {
      return NextResponse.json(
        { error: `Invoice number "${body.invoiceNumber}" already exists.` },
        { status: 400 }
      );
    }

    const newSale = await RetailerSale.create({
      ...body,
      user: userId,
    });

    return NextResponse.json(
      { message: "Sale created successfully", sale: newSale },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST RetailerSale error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create sale." },
      { status: 500 }
    );
  }
}
