import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { RetailerSale } from "@/models/RetailerSale";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const userId = (session.user as any).id;
    const sale = await RetailerSale.findOne({
      _id: params.id,
      user: userId,
    });

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    return NextResponse.json({ sale });
  } catch (error: any) {
    console.error("GET RetailerSale ID error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve sale." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const userId = (session.user as any).id;
    const body = await req.json();

    // Prevent user from updating invoice number to one that already exists for another record
    if (body.invoiceNumber) {
      const existingInvoice = await RetailerSale.findOne({
        invoiceNumber: body.invoiceNumber,
        _id: { $ne: params.id },
      });
      if (existingInvoice) {
        return NextResponse.json(
          { error: `Invoice number "${body.invoiceNumber}" already exists.` },
          { status: 400 }
        );
      }
    }

    const updatedSale = await RetailerSale.findOneAndUpdate(
      { _id: params.id, user: userId },
      { ...body },
      { new: true, runValidators: true }
    );

    if (!updatedSale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Sale updated successfully", sale: updatedSale },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUT RetailerSale ID error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update sale." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const userId = (session.user as any).id;

    const deletedSale = await RetailerSale.findOneAndDelete({
      _id: params.id,
      user: userId,
    });

    if (!deletedSale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Sale deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE RetailerSale ID error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete sale." },
      { status: 500 }
    );
  }
}
