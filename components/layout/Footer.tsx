import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* O nama */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">O nama</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Povezujemo pružatelje lokalnih usluga s klijentima u Hrvatskoj. 
              Pronađite provjerene majstore u vašem gradu.
            </p>
          </div>

          {/* Kategorije */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategorije</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/usluge/vodoinstalater" className="text-gray-600 hover:text-blue-600 text-sm">
                  Vodoinstalateri
                </Link>
              </li>
              <li>
                <Link href="/usluge/elektricar" className="text-gray-600 hover:text-blue-600 text-sm">
                  Električari
                </Link>
              </li>
              <li>
                <Link href="/usluge/bravar" className="text-gray-600 hover:text-blue-600 text-sm">
                  Bravari
                </Link>
              </li>
              <li>
                <Link href="/usluge/keramicar" className="text-gray-600 hover:text-blue-600 text-sm">
                  Keramičari
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kontakt</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Email: info@marketplace.hr</p>
              <p>Telefon: +385 1 234 5678</p>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-gray-400 hover:text-blue-600">
                  Facebook
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-600">
                  Instagram
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-600">
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-gray-500">
            © 2024 Marketplace. Sva prava pridržana.
          </p>
        </div>
      </div>
    </footer>
  );
}
