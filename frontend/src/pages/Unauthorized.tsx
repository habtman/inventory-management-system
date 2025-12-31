export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-red-600">
          Access Denied
        </h1>
        <p>You do not have permission to view this page.</p>
      </div>
    </div>
  );
}
