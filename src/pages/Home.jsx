import WelcomeAuthCard from '../components/WelcomeAuthCard';
import { FaHeart, FaCheckCircle } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Welcome / Signup card (dating.com-style) */}
      <WelcomeAuthCard />

      {/* Features Section */}
      <section className="py-16 px-4 bg-nex-blue">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative w-16 h-16">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M 50,30 Q 30,20 20,40 Q 20,50 30,60 L 50,80"
                      stroke="url(#gradientLeft)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 50,30 Q 70,20 80,40 Q 80,50 70,60 L 50,80"
                      stroke="url(#gradientRight)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <defs>
                      <linearGradient id="gradientLeft" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FF6B35" />
                        <stop offset="100%" stopColor="#FF1493" />
                      </linearGradient>
                      <linearGradient id="gradientRight" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FF1493" />
                        <stop offset="100%" stopColor="#FF6B35" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Real people</h3>
              <p className="text-gray-400">
                The world's largest online community of real people.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-nex rounded-full mx-auto mb-4 flex items-center justify-center">
                <FaCheckCircle className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Easy to use</h3>
              <p className="text-gray-400">
                We provide a user-friendly interface for easy navigation.
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative w-16 h-16">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M 50,30 Q 30,20 20,40 Q 20,50 30,60 L 50,80"
                      stroke="url(#gradientLeft2)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 50,30 Q 70,20 80,40 Q 80,50 70,60 L 50,80"
                      stroke="url(#gradientRight2)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <defs>
                      <linearGradient id="gradientLeft2" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FF6B35" />
                        <stop offset="100%" stopColor="#FF1493" />
                      </linearGradient>
                      <linearGradient id="gradientRight2" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FF1493" />
                        <stop offset="100%" stopColor="#FF6B35" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Community</h3>
              <p className="text-gray-400">
                Connect with like-minded people.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

