export default function BillingCancel() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Payment Canceled</h1>
      <p>Your checkout was canceled. No changes were made.</p>
      <a href="/billing" className="text-blue-600 underline">Back to Billing</a>
    </div>
  );
}
