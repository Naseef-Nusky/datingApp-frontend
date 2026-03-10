import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaMusic } from 'react-icons/fa';
import Logo from './Logo';
import { useLanguage } from '../context/LanguageContext';

export default function SiteFooter() {
  const { language, changeLanguage, languages } = useLanguage();

  const flagUrlFor = (lang) => {
    switch (lang) {
      case 'es':
        return 'https://flagcdn.com/w40/es.png';
      case 'zh':
        return 'https://flagcdn.com/w40/cn.png';
      case 'it':
        return 'https://flagcdn.com/w40/it.png';
      case 'fr':
        return 'https://flagcdn.com/w40/fr.png';
      case 'de':
        return 'https://flagcdn.com/w40/de.png';
      case 'ja':
        return 'https://flagcdn.com/w40/jp.png';
      case 'en':
      default:
        return 'https://flagcdn.com/w40/us.png';
    }
  };

  return (
    <footer className="bg-[#2f3136] text-white py-10 border-t border-white/10">
      <div className="px-4 sm:px-6 lg:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        <div>
          <div className="mb-4">
            <Logo className="h-10 sm:h-12 w-auto object-contain" />
          </div>
          <p className="text-xl leading-[1.2] font-semibold max-w-md mb-6">
            We bring people together for genuine online communication.
          </p>
          <Link
            to="/signup-email"
            className="inline-block text-white font-semibold px-8 py-3 rounded-md transition hover:opacity-90"
            style={{ background: 'linear-gradient(to right, #5A2D8A, #B5458F, #E97672)' }}
          >
            Join us
          </Link>
          <div className="mt-8 ml-3 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-black/40 text-white text-sm font-medium border border-white/20">
            <img
              src={flagUrlFor(language || 'en')}
              alt={languages.find((l) => l.value === language)?.label || 'English'}
              className="w-5 h-5 rounded-full object-cover"
            />
            <select
              className="bg-transparent outline-none cursor-pointer text-sm"
              value={language || 'en'}
              onChange={(e) => changeLanguage(e.target.value)}
            >
              {languages.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#2f3136] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Company</h4>
          <ul className="space-y-3 text-white/70 text-base">
            <li><Link to="/about" className="hover:text-white">About</Link></li>
          </ul>
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
          <div className="mt-6">
            <img
              src="/payment.png"
              alt="Accepted payment methods"
              className="h-6 w-auto opacity-90"
            />
          </div>
          <p className="mt-4 text-xs text-white/60">
            © 2026 Vantage Dating. All rights reserved.
          </p>
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

