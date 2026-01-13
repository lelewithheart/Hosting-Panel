export default function BillingSuccess() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Payment Successful</h1>
      <p>Your subscription has been activated. You can now create more bots according to your plan and tier.</p>
      <a href="/billing" className="text-blue-600 underline">Back to Billing</a>
    </div>
  );
}
