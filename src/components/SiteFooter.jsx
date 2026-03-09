import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaMusic } from 'react-icons/fa';
import Logo from './Logo';

export default function SiteFooter() {
  return (
    <footer className="bg-[#2f3136] text-white py-10 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-4">
            <Logo className="h-10 sm:h-12 w-auto object-contain" />
          </div>
          <p className="text-xl leading-[1.2] font-semibold max-w-md mb-6">
            We bring people together for genuine online communication.
          </p>
          <Link
            to="/signup-email"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-md transition"
          >
            Join us
          </Link>
          <div className="flex items-center gap-3 mt-6">
            {[FaFacebookF, FaInstagram, FaTwitter, FaMusic].map((Icon, idx) => (
              <a
                key={idx}
                href="#"
                className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white/90"
                aria-label="Social link"
              >
                <Icon className="text-sm" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Company</h4>
          <ul className="space-y-3 text-white/70 text-base">
            <li><Link to="/about" className="hover:text-white">About</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Contact</h4>
          <ul className="space-y-3 text-white/70 text-base">
            <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
            <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
            <li><Link to="/safety" className="hover:text-white">Dating Securely</Link></li>
            <li><Link to="/online-dating-advice" className="hover:text-white">Online dating advice</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Conditions</h4>
          <ul className="space-y-3 text-white/70 text-base">
            <li><Link to="/terms" className="hover:text-white">Terms &amp; Conditions</Link></li>
            <li><Link to="/privacy" className="hover:text-white">Privacy policy</Link></li>
            <li><Link to="/refund" className="hover:text-white">Refund and Cancellation Policy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Search for singles</h4>
          <ul className="space-y-3 text-white/70 text-base">
            <li>
              <Link to="/mature-online-dating" className="hover:text-white">
                Mature Singles Dating Online
              </Link>
            </li>
            <li>
              <Link to="/asian-online-dating" className="hover:text-white">
                Asian Singles Dating Online
              </Link>
            </li>
            <li>
              <Link to="/gay-online-dating" className="hover:text-white">
                Gay Singles Dating Online
              </Link>
            </li>
            <li>
              <Link to="/online-dating-singles" className="hover:text-white">
                User Reviews Dating Online
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

