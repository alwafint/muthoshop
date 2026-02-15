import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoice = (order: any, items: any[]) => {
  const doc = jsPDF();

  // ১. হেডার ও লোগো
  doc.setFontSize(22);
  doc.setTextColor(220, 38, 38); // Red-600
  doc.text('MUTHOSHOP', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Hater Muthoi Ponno', 14, 26);
  doc.text('Dhaka, Bangladesh | +880 17XXXXXXXX', 14, 31);

  // ২. ইনভয়েস তথ্য
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Invoice No: #${order.order_number}`, 14, 45);
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 14, 51);
  doc.text(`Status: ${order.status.toUpperCase()}`, 14, 57);

  // ৩. কাস্টমার তথ্য
  doc.setFontSize(10);
  doc.text('BILL TO:', 14, 70);
  doc.setFontSize(11);
  doc.text(order.customer_name || 'Guest', 14, 76);
  doc.setFontSize(10);
  doc.text(`Phone: ${order.customer_phone || 'N/A'}`, 14, 82);
  doc.text(`Address: ${order.customer_address || 'N/A'}`, 14, 88);

  // ৪. আইটেম টেবিল
  const tableData = items.map((item, index) => [
    index + 1,
    item.product_name,
    `${item.quantity} x ${item.price}`,
    `Tk ${item.quantity * item.price}`
  ]);

  autoTable(doc, {
    startY: 100,
    head: [['#', 'Item Description', 'Qty x Price', 'Total']],
    body: tableData,
    headStyles: { fillColor: [220, 38, 38] },
    theme: 'grid'
  });

  // ৫. টোটাল হিসাব
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  doc.setFontSize(12);
  doc.text(`Subtotal: Tk ${order.total_amount}`, 140, finalY + 10);
  doc.text(`Shipping: FREE`, 140, finalY + 17);
  doc.setFontSize(14);
  doc.setTextColor(220, 38, 38);
  doc.text(`Grand Total: Tk ${order.total_amount}`, 140, finalY + 27);

  // ৬. ফুটার
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text('Thank you for shopping with Muthoshop!', 105, finalY + 50, { align: 'center' });

  // ফাইল সেভ করা
  doc.save(`Invoice_Muthoshop_${order.order_number}.pdf`);
};