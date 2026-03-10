export default function GiftRedeemNotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Gift code not valid
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          The gift code you entered is invalid or has expired. Please check the
          code and try again.
        </p>
      </div>
    </main>
  );
}
