import { Link, useLocation, useNavigate } from 'react-router-dom';

/**
 * Shown after user enters email and clicks Continue: "Check your email", login link sent to [email].
 */
export default function CheckEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const devLoginLink = location.state?.devLoginLink;

  const openGmail = () => {
    window.open('https://mail.google.com', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-24 bg-white rounded-full blur-2xl" />
        <div className="absolute top-40 right-20 w-56 h-32 bg-white rounded-full blur-2xl" />
      </div>

      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-gray-100 p-8 md:p-10 text-center">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
          Check your email
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          {devLoginLink
            ? 'SMTP is not configured (dev mode). Use the link below to log in:'
            : <>An email with a login link has been sent to <strong className="text-gray-700">{email || 'your email address'}</strong>.</>}
        </p>

        {devLoginLink ? (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-left">
            <p className="text-amber-800 text-xs font-medium mb-2">Development login link (expires in 1 hour):</p>
            <a href={devLoginLink} className="block text-blue-600 text-sm break-all hover:underline">
              {devLoginLink}
            </a>
            <button
              type="button"
              onClick={() => { window.location.href = devLoginLink; }}
              className="mt-3 w-full py-2.5 px-4 rounded-lg font-semibold text-white text-sm hover:opacity-90"
              style={{ background: 'linear-gradient(to right, #5A2D8A, #B5458F, #E97672)' }}
            >
              Open login link
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={openGmail}
            className="w-full py-3.5 px-6 rounded-xl font-semibold text-white uppercase text-sm tracking-wide mb-3 transition hover:opacity-90"
            style={{ background: 'linear-gradient(to right, #5A2D8A, #B5458F, #E97672)' }}
          >
            Check your Gmail account
          </button>
        )}

        <Link
          to="/signup-email"
          className="block w-full py-3.5 px-6 rounded-xl font-semibold text-gray-700 uppercase text-sm tracking-wide border border-gray-300 hover:bg-gray-50 transition"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
