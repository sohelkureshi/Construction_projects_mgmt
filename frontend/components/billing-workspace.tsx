"use client";

import { FormEvent, useState } from "react";
import { api, type Bill } from "@/lib/api";

type BillLine = { name: string; category: string; standard: string; quantity: string; units: string; rate: string; description: string };

const materialCatalogue = [
  { name: "OPC 53 grade cement", category: "Concrete material", standard: "IS 12269:2013", units: "bag", rate: "430" },
  { name: "Fine aggregate (sand)", category: "Concrete material", standard: "IS 383:2016", units: "m3", rate: "1800" },
  { name: "20 mm coarse aggregate", category: "Concrete material", standard: "IS 383:2016", units: "m3", rate: "2100" },
  { name: "TMT reinforcement steel", category: "Reinforcement", standard: "IS 1786:2008", units: "kg", rate: "67" },
  { name: "Common burnt clay brick", category: "Masonry", standard: "IS 1077:2025", units: "nos", rate: "11" },
  { name: "Concrete work", category: "Measured work", standard: "IS 456:2000 / IS 10262:2019", units: "m3", rate: "6200" },
];

const emptyLine = (): BillLine => ({ ...materialCatalogue[0], quantity: "", description: "" });
const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);

export function BillingWorkspace({ projectId, bills, canCreate, onSaved }: { projectId: string; bills: Bill[]; canCreate: boolean; onSaved: () => void }) {
  const [lines, setLines] = useState<BillLine[]>([emptyLine()]);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const totalCertified = bills.reduce((sum, bill) => sum + bill.total_amount, 0);
  const totalLines = bills.reduce((sum, bill) => sum + bill.items.length, 0);
  const currentValue = lines.reduce((sum, line) => sum + (Number(line.quantity) || 0) * (Number(line.rate) || 0), 0);

  const updateLine = (index: number, field: keyof BillLine, value: string) => setLines((current) => current.map((line, lineIndex) => {
    if (lineIndex !== index) return line;
    if (field === "name") {
      const match = materialCatalogue.find((item) => item.name === value);
      return match ? { ...line, ...match } : { ...line, name: value };
    }
    return { ...line, [field]: value };
  }));

  const createBill = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setError(""); setSaving(true);
    try {
      await api(`/api/projects/${projectId}/bills`, { method: "POST", body: JSON.stringify({ Bill_Name: form.get("Bill_Name"), date: form.get("date"), bill_type: form.get("bill_type"), certification_status: "Draft", notes: form.get("notes"), items: lines.map((line, index) => ({ ...line, item_id: index + 1, quantity: Number(line.quantity), rate: Number(line.rate) })) }) });
      formElement.reset(); setLines([emptyLine()]); setIsOpen(false); onSaved();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to create the bill."); }
    finally { setSaving(false); }
  };

  return <div className="billing-workspace">
    <div className="billing-summary">
      <article><span>Certified to date</span><strong>{money(totalCertified)}</strong><small>{bills.length} running bill{bills.length === 1 ? "" : "s"} recorded</small></article>
      <article><span>Measured items</span><strong>{totalLines}</strong><small>Across all submitted BOQ lines</small></article>
      <article><span>New bill value</span><strong>{money(currentValue)}</strong><small>Live calculation before submission</small></article>
    </div>
    <div className="standards-panel">
      <div><p className="eyebrow">Quality traceability</p><h3>Material references</h3><p>Use these as procurement and measurement checkpoints. Final design, testing, and certification remain with the appointed engineer.</p></div>
      <div className="standard-tags"><span>Concrete / IS 456:2000</span><span>Mix design / IS 10262:2019</span><span>Cement / IS 12269:2013</span><span>Aggregates / IS 383:2016</span><span>Steel / IS 1786:2008</span><span>Bricks / IS 1077:2025</span></div>
    </div>
    <div className="billing-section-heading"><div><p className="eyebrow">Running account register</p><h3>Submitted bills</h3></div>{canCreate && <button className="button" type="button" onClick={() => setIsOpen((open) => !open)}>{isOpen ? "Close bill editor" : "Create running bill"}</button>}</div>
    {bills.length ? <div className="bill-register">{bills.map((bill) => <article className="bill-card" key={bill._id}><div className="bill-card-head"><div><span className="approval draft">{bill.certification_status || "Recorded"}</span><h4>{bill.Bill_Name}</h4><small>{new Date(bill.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} / {bill.bill_type || "Running account"}</small></div><strong>{money(bill.total_amount)}</strong></div><div className="bill-items">{bill.items.map((item, index) => <div key={`${bill._id}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><b>{item.name}</b><small>{item.quantity} {item.units} x {money(item.rate)}</small><strong>{money(item.amount)}</strong></div>)}</div>{bill.notes && <p className="bill-note">{bill.notes}</p>}</article>)}</div> : <p className="empty-state">No bills yet. Create a running bill to begin a traceable quantity and material register.</p>}
    {canCreate && isOpen && <form className="bill-editor" onSubmit={createBill}><div className="bill-editor-head"><div><p className="eyebrow">New measurement sheet</p><h3>Build a BOQ-backed running bill</h3></div><strong>{money(currentValue)}</strong></div><div className="bill-meta"><label>Bill title<input name="Bill_Name" placeholder="RA Bill 01 - Foundation works" required /></label><label>Measurement date<input name="date" type="date" required /></label><label>Bill type<select name="bill_type" defaultValue="Running account"><option>Running account</option><option>Material reconciliation</option><option>Final bill</option></select></label></div><div className="boq-table"><div className="boq-head"><span>Material / work item</span><span>Quantity</span><span>Unit</span><span>Rate</span><span>Amount</span><span /></div>{lines.map((line, index) => <div className="boq-row" key={index}><select value={line.name} onChange={(event) => updateLine(index, "name", event.target.value)}><option value="">Select material / work item</option>{materialCatalogue.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select><input value={line.quantity} onChange={(event) => updateLine(index, "quantity", event.target.value)} type="number" min="0" step="any" aria-label="Quantity" required /><input value={line.units} onChange={(event) => updateLine(index, "units", event.target.value)} aria-label="Unit" required /><input value={line.rate} onChange={(event) => updateLine(index, "rate", event.target.value)} type="number" min="0" step="any" aria-label="Rate" required /><strong>{money((Number(line.quantity) || 0) * (Number(line.rate) || 0))}</strong><button className="remove-line" type="button" onClick={() => setLines((current) => current.length === 1 ? current : current.filter((_, lineIndex) => lineIndex !== index))} disabled={lines.length === 1}>Remove</button></div>)}</div><button className="add-line" type="button" onClick={() => setLines((current) => [...current, emptyLine()])}>+ Add material or work item</button><label className="bill-notes">Site / measurement notes<textarea name="notes" placeholder="Mention measurement book reference, test certificates, delivery challans, or any deductions." /></label>{error && <p className="form-error">{error}</p>}<div className="bill-actions"><span>Amounts are calculated from quantity x agreed rate.</span><button className="button" disabled={saving}>{saving ? "Saving bill..." : "Save draft bill"}</button></div></form>}
  </div>;
}
