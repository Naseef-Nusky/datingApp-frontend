import { Link } from 'react-router-dom';

export default function HelpCenter() {
  const faqs = [
    {
      q: 'How do I create an account?',
      a: 'Click "Take a chance!" or "Sign in with Google" on the home page. You can sign up with your email or use Google for a quick registration.',
    },
    {
      q: 'How do I upgrade or purchase credits?',
      a: 'Once logged in, go to your profile or dashboard and look for the Upgrade or Refill option. You can choose from credit packs or subscription plans.',
    },
    {
      q: 'How do I cancel my subscription?',
      a: 'Go to Settings → Manage Account → Cancel Subscription. Cancellation prevents future charges but does not refund the current billing period.',
    },
    {
      q: 'I think I was scammed. What should I do?',
      a: 'Submit a complaint using the reporting tools in the app or website. Once verified, you may receive a refund of credits spent communicating with the reported member. See our Safety & Security Policy for details.',
    },
    {
      q: 'How do I delete my account?',
      a: 'You can delete your account from your profile settings. Some data may be retained where legally required or for fraud prevention.',
    },
    {
      q: 'Where can I find more safety tips?',
      a: 'Read our Safety & Security Policy for essential guidelines on protecting yourself and others while using Vantage Dating.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Help Center</h1>
            <Link to="/" className="text-sm font-medium text-blue-600 hover:text-blue-800">← Back to Home</Link>
          </div>
          <div className="px-6 py-8 text-gray-800 text-sm leading-relaxed">
            <p className="mb-8">
              Find answers to common questions about Vantage Dating. If you need further assistance, please{' '}
              <Link to="/contact" className="text-blue-600 hover:underline">contact us</Link>.
            </p>
            <div className="space-y-6">
              {faqs.map((item, idx) => (
                <div key={idx}>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
                  <p className="text-gray-600">{item.a}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2">Related Policies</h3>
              <ul className="space-y-1">
                <li><Link to="/terms" className="text-blue-600 hover:underline">Terms & Conditions</Link></li>
                <li><Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link></li>
                <li><Link to="/refund" className="text-blue-600 hover:underline">Refund and Cancellation Policy</Link></li>
                <li><Link to="/safety" className="text-blue-600 hover:underline">Safety & Security Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
