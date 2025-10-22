export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl mb-6">Stranica nije pronađena</p>
        <a href="/" className="text-blue-600 hover:underline">
          Povratak na početnu
        </a>
      </div>
    </div>
  );
}
