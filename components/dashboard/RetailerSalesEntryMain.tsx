"use client";

import React, { useState, useEffect } from "react";
import { 
  ShoppingCart, Plus, Minus, Trash2, Save, Printer, User, 
  CreditCard, Loader2, Tag, Percent, IndianRupee, Hash 
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";

interface CartItem {
  id: string; // temporary frontend id
  name: string;
  quantity: number;
  price: number;
  discount: number; // percentage
  tax: number; // percentage
  subtotal: number;
}

interface PaymentMode {
  _id: string;
  name: string;
  type: string;
}

// Dummy products for quick add card UI
const QUICK_PRODUCTS = [
  { id: "P1", name: "Premium Widget", price: 499 },
  { id: "P2", name: "Basic Tool", price: 149 },
  { id: "P3", name: "Service Hour", price: 999 },
  { id: "P4", name: "Maintenance Kit", price: 299 },
  { id: "P5", name: "Pro License", price: 1999 },
  { id: "P6", name: "Coffee Beans", price: 350 },
];

export default function RetailerSalesEntryMain() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
  
  // Customer & Invoice state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [amountPaid, setAmountPaid] = useState<number | "">(0);
  const [shippingFee, setShippingFee] = useState<number | "">(0);
  const [overallDiscount, setOverallDiscount] = useState<number | "">(0);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch payment modes
    const fetchPaymentModes = async () => {
      try {
        const res = await fetch("/api/payment-modes");
        const data = await res.json();
        if (data.paymentModes) {
          setPaymentModes(data.paymentModes);
          if (data.paymentModes.length > 0) {
            setPaymentMode(data.paymentModes[0].name);
          }
        }
      } catch (err) {
        console.error("Error fetching payment modes:", err);
      }
    };
    fetchPaymentModes();
  }, []);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const calculateItemSubtotal = (price: number, qty: number, discPercent: number, taxPercent: number) => {
    const base = price * qty;
    const afterDisc = base - (base * discPercent) / 100;
    const final = afterDisc + (afterDisc * taxPercent) / 100;
    return Number(final.toFixed(2));
  };

  const addToCart = (product: { name: string; price: number }) => {
    const existing = cart.find(item => item.name === product.name);
    if (existing) {
      updateCartItem(existing.id, "quantity", existing.quantity + 1);
    } else {
      const newItem: CartItem = {
        id: generateId(),
        name: product.name,
        quantity: 1,
        price: product.price,
        discount: 0,
        tax: 0,
        subtotal: product.price
      };
      setCart([...cart, newItem]);
    }
    toast.success(`${product.name} added to cart`);
  };

  const updateCartItem = (id: string, field: keyof CartItem, value: any) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        updated.subtotal = calculateItemSubtotal(
          updated.price, 
          updated.quantity, 
          updated.discount, 
          updated.tax
        );
        return updated;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Derived Totals
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const finalDiscountAmount = (subtotal * (Number(overallDiscount) || 0)) / 100; 
  const totalAmount = subtotal - finalDiscountAmount + (Number(shippingFee) || 0);
  const balanceDue = totalAmount - (Number(amountPaid) || 0);

  const handleSaveSale = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    if (!paymentMode) {
      toast.error("Please select a payment mode");
      return;
    }

    setIsSubmitting(true);
    try {
      const invoiceNumber = `INV-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random()*10000)}`;
      
      const payload = {
        customerName,
        customerPhone,
        customerEmail,
        items: cart,
        subtotal,
        discountAmount: finalDiscountAmount,
        taxAmount: cart.reduce((sum, item) => sum + (((item.price * item.quantity * (1 - item.discount/100)) * item.tax)/100), 0),
        shippingFee: Number(shippingFee) || 0,
        totalAmount,
        amountPaid: Number(amountPaid) || 0,
        balanceDue,
        paymentMode,
        status: balanceDue <= 0 ? "Paid" : (Number(amountPaid) > 0 ? "Partially Paid" : "Unpaid"),
        invoiceNumber,
      };

      const res = await fetch("/api/retailer-sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      toast.success(`Sale saved successfully! Invoice: ${invoiceNumber}`);
      // Reset form
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setAmountPaid(0);
      setShippingFee(0);
      setOverallDiscount(0);

    } catch (err: any) {
      toast.error(err.message || "Failed to save sale");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            Retailer Sales Entry
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage transactions, calculate orders and generate invoices.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground hover:bg-secondary/80 rounded-xl font-medium transition-all print:hidden"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button 
            onClick={handleSaveSale}
            disabled={isSubmitting || cart.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed print:hidden shadow-soft"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Sale
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT PANE: Products & Cart */}
        <div className="xl:col-span-8 space-y-6 print:hidden">
          
          {/* Quick Add Products */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <Tag className="h-4 w-4" /> Quick Add Products
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {QUICK_PRODUCTS.map(p => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="flex flex-col items-start p-4 rounded-xl border border-border bg-background hover:border-primary hover:bg-primary/5 transition-all text-left active:scale-[0.98]"
                >
                  <span className="font-semibold text-foreground text-sm line-clamp-1">{p.name}</span>
                  <span className="text-primary font-bold mt-1 flex items-center">
                    <IndianRupee className="h-3 w-3 mr-0.5" />
                    {p.price}
                  </span>
                </button>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
              <Input 
                id="custom-product" 
                placeholder="Custom product name..." 
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = e.currentTarget.value.trim();
                    if (val) {
                      addToCart({ name: val, price: 0 });
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
              <button 
                className="p-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                onClick={() => {
                  const input = document.getElementById('custom-product') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    addToCart({ name: input.value.trim(), price: 0 });
                    input.value = '';
                  }
                }}
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="bg-card border border-border rounded-2xl p-0 overflow-hidden shadow-sm">
             <div className="p-5 border-b border-border bg-secondary/30">
               <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                 <ShoppingCart className="h-4 w-4" /> Order Items ({cart.length})
               </h3>
             </div>
             
             {cart.length === 0 ? (
               <div className="p-10 text-center text-muted-foreground flex flex-col items-center justify-center">
                 <ShoppingCart className="h-10 w-10 mb-3 opacity-20" />
                 <p>No items in the order yet.</p>
                 <p className="text-xs mt-1">Select products from above to add to cart.</p>
               </div>
             ) : (
               <div className="divide-y divide-border overflow-x-auto">
                 <table className="w-full text-left text-sm whitespace-nowrap">
                   <thead className="bg-secondary/20 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                     <tr>
                       <th className="px-4 py-3">Product</th>
                       <th className="px-4 py-3 w-24">Price</th>
                       <th className="px-4 py-3 w-32">Qty</th>
                       <th className="px-4 py-3 w-20">Disc %</th>
                       <th className="px-4 py-3 w-20">Tax %</th>
                       <th className="px-4 py-3 text-right">Subtotal</th>
                       <th className="px-4 py-3 w-10"></th>
                     </tr>
                   </thead>
                   <tbody>
                     {cart.map((item) => (
                       <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                         <td className="px-4 py-3 font-medium text-foreground">
                            {item.name}
                         </td>
                         <td className="px-4 py-3">
                           <input 
                             type="number"
                             value={item.price}
                             onChange={(e) => updateCartItem(item.id, 'price', Number(e.target.value) || 0)}
                             className="w-full bg-transparent border-b border-transparent focus:border-primary outline-none px-1 py-0.5"
                           />
                         </td>
                         <td className="px-4 py-3">
                           <div className="flex items-center gap-2 bg-background border border-border rounded-lg p-1 w-fit">
                             <button onClick={() => updateCartItem(item.id, 'quantity', Math.max(1, item.quantity - 1))} className="p-1 hover:bg-secondary rounded">
                               <Minus className="h-3 w-3" />
                             </button>
                             <span className="w-6 text-center font-medium">{item.quantity}</span>
                             <button onClick={() => updateCartItem(item.id, 'quantity', item.quantity + 1)} className="p-1 hover:bg-secondary rounded">
                               <Plus className="h-3 w-3" />
                             </button>
                           </div>
                         </td>
                         <td className="px-4 py-3">
                            <input 
                             type="number"
                             value={item.discount}
                             onChange={(e) => updateCartItem(item.id, 'discount', Number(e.target.value) || 0)}
                             className="w-full bg-transparent border-b border-transparent focus:border-primary outline-none px-1 py-0.5"
                           />
                         </td>
                         <td className="px-4 py-3">
                            <input 
                             type="number"
                             value={item.tax}
                             onChange={(e) => updateCartItem(item.id, 'tax', Number(e.target.value) || 0)}
                             className="w-full bg-transparent border-b border-transparent focus:border-primary outline-none px-1 py-0.5"
                           />
                         </td>
                         <td className="px-4 py-3 text-right font-bold text-primary">
                           ₹{item.subtotal.toFixed(2)}
                         </td>
                         <td className="px-4 py-3 text-right">
                           <button 
                             onClick={() => removeFromCart(item.id)}
                             className="p-1.5 text-muted-foreground hover:text-danger hover:bg-danger/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                           >
                             <Trash2 className="h-4 w-4" />
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             )}
          </div>
        </div>

        {/* RIGHT PANE: Summary & Form */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Customer Details */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm print:shadow-none print:border-none print:p-0">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <User className="h-4 w-4" /> Customer Details
            </h3>
            <div className="space-y-4">
              <Input 
                placeholder="Customer Name" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                icon={User}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input 
                  placeholder="Phone" 
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
                <Input 
                  placeholder="Email" 
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Billing Summary */}
          <div className="bg-gradient-to-b from-card to-secondary/20 border border-border rounded-2xl p-6 shadow-soft">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-5 flex items-center gap-2 border-b border-border pb-3">
              <Hash className="h-4 w-4" /> Billing Summary
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">₹{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center text-muted-foreground group">
                <span className="flex items-center gap-2">
                  Overall Discount 
                  <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-md print:hidden">%</span>
                </span>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={overallDiscount} 
                    onChange={e => setOverallDiscount(Number(e.target.value) || 0)}
                    className="w-12 text-right bg-background border border-border rounded px-1 py-0.5 outline-none focus:border-primary print:hidden"
                  />
                  <span className="font-semibold text-danger">
                    - ₹{finalDiscountAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-muted-foreground">
                <span>Shipping Fee</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={shippingFee} 
                    onChange={e => setShippingFee(Number(e.target.value) || 0)}
                    className="w-16 text-right bg-background border border-border rounded px-1 py-0.5 outline-none focus:border-primary print:hidden"
                  />
                  <span className="font-semibold text-foreground">
                    + ₹{Number(shippingFee || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="border-t border-border border-dashed pt-4 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-foreground">Total Amount</span>
                  <span className="text-2xl font-black text-primary">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4 print:hidden">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Amount Paid
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground font-medium">₹</span>
                  <input 
                    type="number" 
                    value={amountPaid} 
                    onChange={e => setAmountPaid(Number(e.target.value) || 0)}
                    className="w-full bg-background border border-input rounded-md py-2.5 pl-8 pr-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-danger/10 rounded-xl border border-danger/20">
                <span className="text-danger font-bold text-sm">Balance Due</span>
                <span className="text-danger font-black text-lg">₹{Math.max(0, balanceDue).toFixed(2)}</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Payment Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {paymentModes.map(pm => (
                    <button
                      key={pm._id}
                      onClick={() => setPaymentMode(pm.name)}
                      className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        paymentMode === pm.name 
                          ? "bg-primary text-white border-primary shadow-soft" 
                          : "bg-background border-border hover:bg-secondary/50 text-muted-foreground"
                      }`}
                    >
                      {pm.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Print only invoice structure (hidden on screen) */}
      <div className="hidden print:block fixed inset-0 bg-white text-black p-8 z-50">
         <div className="text-center border-b-2 border-black pb-4 mb-6">
           <h1 className="text-3xl font-black uppercase tracking-widest">INVOICE</h1>
           <p className="text-gray-500 mt-1">Date: {new Date().toLocaleDateString()}</p>
         </div>
         <div className="flex justify-between mb-8">
           <div>
             <h3 className="font-bold text-gray-500 uppercase text-xs">Billed To</h3>
             <p className="font-bold text-lg">{customerName || "Walk-in Customer"}</p>
             {customerPhone && <p>{customerPhone}</p>}
             {customerEmail && <p>{customerEmail}</p>}
           </div>
           <div className="text-right">
             <h3 className="font-bold text-gray-500 uppercase text-xs">Payment Method</h3>
             <p className="font-bold text-lg">{paymentMode}</p>
           </div>
         </div>
         
         <table className="w-full text-left mb-8">
            <thead className="border-b-2 border-black">
              <tr>
                <th className="py-2">Item</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cart.map(item => (
                <tr key={item.id}>
                  <td className="py-3 font-medium">{item.name}</td>
                  <td className="py-3 text-center">{item.quantity}</td>
                  <td className="py-3 text-right">₹{item.price.toFixed(2)}</td>
                  <td className="py-3 text-right font-bold">₹{item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
         </table>
         
         <div className="flex justify-end border-t-2 border-black pt-4">
           <div className="w-64 space-y-2">
             <div className="flex justify-between">
               <span>Subtotal:</span>
               <span>₹{subtotal.toFixed(2)}</span>
             </div>
             {finalDiscountAmount > 0 && (
               <div className="flex justify-between text-red-600">
                 <span>Discount:</span>
                 <span>-₹{finalDiscountAmount.toFixed(2)}</span>
               </div>
             )}
             {Number(shippingFee) > 0 && (
               <div className="flex justify-between">
                 <span>Shipping:</span>
                 <span>₹{Number(shippingFee).toFixed(2)}</span>
               </div>
             )}
             <div className="flex justify-between text-xl font-black pt-2 border-t border-gray-300">
               <span>Total:</span>
               <span>₹{totalAmount.toFixed(2)}</span>
             </div>
             <div className="flex justify-between text-gray-600 pt-1">
               <span>Amount Paid:</span>
               <span>₹{Number(amountPaid).toFixed(2)}</span>
             </div>
             {balanceDue > 0 && (
               <div className="flex justify-between text-red-600 font-bold pt-1">
                 <span>Balance Due:</span>
                 <span>₹{balanceDue.toFixed(2)}</span>
               </div>
             )}
           </div>
         </div>
         
         <div className="mt-16 text-center text-gray-400 text-sm italic">
           Thank you for your business!
         </div>
      </div>
    </div>
  );
}
