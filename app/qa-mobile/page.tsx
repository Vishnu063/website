import { notFound } from "next/navigation";
export default function QA() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ fontSize: 20 }}>Responsive QA · 390 × 844</h1>
      <iframe
        title="Mobile website preview"
        src="/"
        width={390}
        height={844}
        style={{ border: "1px solid #555", borderRadius: 15, maxWidth: "100%" }}
      />
    </div>
  );
}
