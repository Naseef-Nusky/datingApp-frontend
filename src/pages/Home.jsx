import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactCountryFlag from 'react-country-flag';
import {
  FaArrowRight,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaMusic,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import Logo from '../components/Logo';

const Home = () => {
  const languageOptions = [
    { code: 'en', label: 'English', countryCode: 'US' },
    { code: 'es', label: 'Español', countryCode: 'ES' },
    { code: 'zh', label: '中文', countryCode: 'CN' },
    { code: 'it', label: 'Italiano', countryCode: 'IT' },
    { code: 'fr', label: 'Français', countryCode: 'FR' },
    { code: 'de', label: 'Deutsch', countryCode: 'DE' },
    { code: 'ja', label: '日本語', countryCode: 'JP' },
  ];
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(languageOptions[0]);
  const [activeReviewIndex, setActiveReviewIndex] = useState(1);
  const [activeJourneyIndex, setActiveJourneyIndex] = useState(1);
  const languageMenuRef = useRef(null);

  useEffect(() => {
    const onDocClick = (event) => {
      if (!languageMenuRef.current) return;
      if (!languageMenuRef.current.contains(event.target)) {
        setShowLanguageMenu(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const featureCards = [
    {
      title: 'Secure Experience',
      text: 'Your safety is maintained through advanced anti-scam protection systems.',
      image: '/SecureExperience.png',
    },
    {
      title: 'Meaningful Matches',
      text: 'Create genuine connections by discovering shared interests and common passions.',
      image: '/MeaningfulMatches.png',
    },
    {
      title: 'Verified Members',
      text: 'Members with verification badges have confirmed their identity using government-issued identification.',
      image: '/VerifiedMembers.png',
    },
    {
      title: 'Diverse Community',
      text: 'Our platform includes both premium subscribers and free users.',
      image: '/DiverseCommunity.png',
    },
  ];

  const reviewCards = [
    {
      name: 'Lena R.',
      source: 'User review',
      text: 'What stands out to me is the variety of people you can connect with here. Meeting individuals from different cultures and places really expands your dating experience.',
      muted: true,
    },
    {
      name: 'Marcus T.',
      source: 'User review',
      text: "When I joined online dating at 35, I didn't know what to expect. I was pleasantly surprised to form a meaningful connection with someone from another part of the world. It felt genuine and refreshing.",
      muted: false,
    },
    {
      name: 'Robert K.',
      source: 'User review',
      text: "At my age, I wasn't expecting much from online dating, but this platform changed my perspective. I found someone I truly connected with, both emotionally and intellectually.",
      muted: true,
    },
    {
      name: 'Emily W.',
      source: 'User review',
      text: 'So far, my experience has been very positive. The messaging tools are easy to use, conversations feel natural, and the strong focus on safety really gives peace of mind.',
      muted: true,
    },
    {
      name: 'Daniel M.',
      source: 'User review',
      text: 'I appreciate how smooth and engaging the communication features are. It is easy to start real conversations, and knowing the platform values user safety makes the experience even better.',
      muted: true,
    },
    {
      name: 'Sofia L.',
      source: 'User review',
      text: 'I really enjoy how easy it is to meet people from different backgrounds here. The platform makes conversations feel natural, and connecting with someone from another country has been a great experience.',
      muted: true,
    },
  ];

  const journeySlides = [
    {
      heading: 'ComplaintsBoard',
      sub: 'Excellence Award Recipient',
    },
    {
      heading: '26+ years',
      sub: 'bringing singles together worldwide',
    },
    {
      heading: 'Connecting people',
      sub: 'across 150+ countries',
    },
  ];

  const getJourneyIndex = (offset) =>
    (activeJourneyIndex + offset + journeySlides.length) % journeySlides.length;

  const insightsCards = [
    {
      title: 'Dating Uruguayan Women',
      text: 'Interested in connecting with Uruguayan women? Discover how personality, lifestyle, and relationship values influence communication, dating etiquette, and early connections.',
      author: 'Editorial Team',
      date: '23/02/2026',
      image: '/Dating%20Uruguayan%20Women.png',
    },
    {
      title: 'Dating Vietnamese Women: Culture & Modern Love',
      text: 'Explore what it’s like to date Vietnamese women. Learn how culture, family values, and modern expectations shape communication, dating behavior, and online relationships.',
      author: 'Salina Owens',
      date: '18/02/2026',
      image: '/Dating%20Vietnamese%20Women.png',
    },
    {
      title: '50+ Flirty Text Messages for Him',
      text: 'Looking to spark attraction? Find playful, romantic, and clever flirty messages that help you connect, tease, and make him smile effortlessly.',
      author: 'Salina Owens',
      date: '20/08/2025',
      image: '/Flirty%20Text%20Messages%20for%20Him.png',
    },
  ];

  const totalReviews = reviewCards.length;
  const getWrappedReviewIndex = (index) => (index + totalReviews) % totalReviews;
  const leftReview = reviewCards[getWrappedReviewIndex(activeReviewIndex - 1)];
  const centerReview = reviewCards[getWrappedReviewIndex(activeReviewIndex)];
  const rightReview = reviewCards[getWrappedReviewIndex(activeReviewIndex + 1)];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <section
        className="relative min-h-[720px] md:min-h-[640px] bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35)), url('/hero%20img.png')",
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-10 relative min-h-[720px] md:min-h-[640px] flex items-center justify-center lg:justify-start pt-24 md:pt-10">
          <div className="absolute top-4 left-3 right-3 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between z-10">
            <Link to="/" className="inline-flex items-center">
              <Logo className="h-7 sm:h-9 w-auto object-contain" />
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/login"
                className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-white text-sm sm:text-base font-semibold transition hover:opacity-90 whitespace-nowrap"
                style={{
                  background: 'linear-gradient(to right, #5A2D8A, #B5458F, #E97672)',
                }}
              >
                Log In
              </Link>
              <div className="relative" ref={languageMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowLanguageMenu((prev) => !prev)}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[#3d4047] hover:bg-[#32353b] text-white font-medium transition inline-flex items-center gap-2 sm:gap-3 min-w-[72px] sm:min-w-[88px] justify-between"
                  aria-label="Language selector"
                >
                  <span className="inline-flex items-center">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden inline-flex items-center justify-center">
                      <ReactCountryFlag
                        countryCode={selectedLanguage.countryCode}
                        svg
                        style={{ width: '1.35em', height: '1.35em' }}
                        title={selectedLanguage.label}
                      />
                    </span>
                  </span>
                  <FaChevronDown className={`text-sm text-white/90 transition ${showLanguageMenu ? 'rotate-180' : ''}`} />
                </button>

                {showLanguageMenu && (
                  <div className="absolute right-0 mt-2 w-[160px] sm:w-[170px] bg-[#3d4047] rounded-2xl shadow-2xl py-2 border border-white/5">
                    {languageOptions.map((option) => (
                      <button
                        key={option.code}
                        type="button"
                        onClick={() => {
                          setSelectedLanguage(option);
                          setShowLanguageMenu(false);
                        }}
                        className={`w-full px-3 py-2.5 text-left inline-flex items-center gap-2.5 text-base sm:text-lg transition ${
                          selectedLanguage.code === option.code ? 'text-white bg-white/10' : 'text-white/90 hover:bg-white/10'
                        }`}
                      >
                        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden inline-flex items-center justify-center">
                          <ReactCountryFlag
                            countryCode={option.countryCode}
                            svg
                            style={{ width: '1.35em', height: '1.35em' }}
                            title={option.label}
                          />
                        </span>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/95 rounded-3xl shadow-2xl w-full max-w-[460px] p-4 pt-8 sm:p-7 sm:pt-10 lg:mt-40 lg:mb-20 text-center">
            <div className="flex justify-center mb-6">
              <Logo className="h-10 sm:h-11 w-auto object-contain" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Global Online Dating</h2>
            <p className="text-gray-600 text-base sm:text-lg leading-snug mb-6">
              Enjoy virtual connections with like-minded people around the world
            </p>

            <Link
              to="/signup-email"
              className="block w-full text-center py-3 rounded-lg text-white text-lg font-semibold transition mb-4 hover:opacity-90"
              style={{
                background: 'linear-gradient(to right, #5A2D8A, #B5458F, #E97672)',
              }}
            >
              Take a chance!
            </Link>

            <a
              href={`${import.meta.env.VITE_API_URL || ''}/api/auth/google`}
              className="flex items-center justify-center gap-3 w-full bg-white border border-gray-300 text-gray-800 text-base font-medium py-3 px-6 rounded-lg hover:bg-gray-50 transition no-underline"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </a>

            <p className="text-xs text-gray-500 mt-4 leading-relaxed">
              By clicking &quot;Take a chance!&quot; you agree with the{' '}
              <Link to="/terms" className="underline hover:text-gray-700">Terms &amp; Conditions</Link>,{' '}
              <Link to="/privacy" className="underline hover:text-gray-700">Privacy Policy</Link>,{' '}
              <Link to="/refund" className="underline hover:text-gray-700">Refund and Cancellation Policy</Link> and{' '}
              <Link to="/terms#content" className="underline hover:text-gray-700">Content Policy</Link>. You can terminate your account or opt out of any or part of the services (including linked-one) any time.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featureCards.map((item) => (
            <div key={item.title} className="overflow-hidden bg-transparent">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-28 object-contain rounded-lg"
                loading="lazy"
              />
              <div className="p-4">
                <h3 className="font-semibold text-base mb-2 text-center">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed text-center">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid md:grid-cols-2 gap-10 items-center mb-10">
            <div>
              <h2 className="text-2xl font-bold mb-3">Connect online and chat with singles</h2>
              <p className="text-gray-600 mb-5">
                Join a premium social platform where authentic conversations thrive and diverse connections come together.
              </p>
            </div>
            <img
              src="/onlineChat.png"
              alt="Connect online and chat with singles"
              className="object-contain w-full h-80 sm:h-96"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <img
              src="/virtualdating.png"
              alt="Interactive virtual dating tools"
              className="object-contain w-full h-80 sm:h-96"
            />
            <div>
              <h2 className="text-2xl font-bold mb-3">Interactive virtual dating tools</h2>
              <p className="text-gray-600 mb-4">
                Explore features that simplify connection, including video calls, voice messaging, and virtual gifts. Our platform is built to deliver smooth, engaging, and enjoyable conversations.
              </p>
              <Link
                to="/signup-email"
                className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Start Now <FaArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-3">Explore diverse profiles</h2>
              <p className="text-gray-600 leading-relaxed">
                Connect with singles worldwide, discover shared interests, and build meaningful virtual connections.
                Chat and date online, exchange experiences, and communicate effortlessly with instant translation tools.
                Make your dating experience more exciting with Vantage Dating!
              </p>
            </div>
            <img
              src="/diverseprofiles.png"
              alt="Explore diverse profiles"
              className="object-contain w-full h-80 sm:h-96"
            />
          </div>
        </div>
      </section>

      <section className="bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-black">Find singles online</h2>
            <p className="text-black mt-4 max-w-4xl mx-auto leading-relaxed text-center">
              Join a diverse community of men and women and discover matches based on your interests, values, and relationship goals.
              Use smart profile filters and virtual discovery tools to connect with the right people.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <img
                src="/mature%20singles.png"
                alt="Dating for mature singles online"
                className="w-full h-56 object-cover rounded-xl mb-4"
              />
              <h3 className="font-semibold text-lg text-black mb-2">Dating for mature singles online</h3>
              <p className="text-sm text-black leading-relaxed">
                Meet like-minded mature singles looking for meaningful connections.
              </p>
            </div>

            <div>
              <img
                src="/Asian%20singles.png"
                alt="Asian singles dating online"
                className="w-full h-56 object-cover object-top rounded-xl mb-4"
              />
              <h3 className="font-semibold text-lg text-black mb-2">Asian singles dating online</h3>
              <p className="text-sm text-black leading-relaxed">
                Connect with Asian singles and explore genuine relationships online.
              </p>
            </div>

            <div>
              <img
                src="/Gay%20singles.png"
                alt="Gay singles dating online"
                className="w-full h-56 object-cover object-top rounded-xl mb-4"
              />
              <h3 className="font-semibold text-lg text-black mb-2">Gay singles dating online</h3>
              <p className="text-sm text-black leading-relaxed">
                Discover inclusive dating experiences and connect with gay singles worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-2">Vantage Dating User Reviews</h3>
          <p className="text-center text-gray-500 mb-8">
            Hear directly from genuine users who found success on our platform.
          </p>

          <div className="grid md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 items-center">
            <article className="bg-white rounded-2xl p-6 border border-gray-200 h-[320px] flex flex-col justify-between overflow-hidden">
              <p className="text-gray-400 text-lg leading-relaxed mb-6 line-clamp-6">
                {leftReview.text}
              </p>
              <div className="flex items-center gap-3">
                <img src="/profile.png" alt={leftReview.name} className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-gray-600">{leftReview.name}</p>
                  <p className="text-xs text-gray-400">{leftReview.source}</p>
                </div>
              </div>
            </article>

            <button
              type="button"
              onClick={() => setActiveReviewIndex((prev) => getWrappedReviewIndex(prev - 1))}
              className="w-8 h-8 rounded-full border border-gray-300 text-gray-500 inline-flex items-center justify-center"
            >
              <FaChevronLeft className="text-xs" />
            </button>

            <article className="bg-white rounded-2xl p-6 border border-gray-300 h-[320px] flex flex-col justify-between overflow-hidden">
              <p className="text-gray-800 text-lg leading-relaxed mb-6 line-clamp-6">
                {centerReview.text}
              </p>
              <div className="flex items-center gap-3">
                <img src="/profile.png" alt={centerReview.name} className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-gray-800">{centerReview.name}</p>
                  <p className="text-xs text-gray-500">{centerReview.source}</p>
                </div>
              </div>
            </article>

            <button
              type="button"
              onClick={() => setActiveReviewIndex((prev) => getWrappedReviewIndex(prev + 1))}
              className="w-8 h-8 rounded-full border border-gray-300 text-gray-500 inline-flex items-center justify-center"
            >
              <FaChevronRight className="text-xs" />
            </button>

            <article className="bg-white rounded-2xl p-6 border border-gray-200 h-[320px] flex flex-col justify-between overflow-hidden">
              <p className="text-gray-400 text-lg leading-relaxed mb-6 line-clamp-6">
                {rightReview.text}
              </p>
              <div className="flex items-center gap-3">
                <img src="/profile.png" alt={rightReview.name} className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-gray-600">{rightReview.name}</p>
                  <p className="text-xs text-gray-400">{rightReview.source}</p>
                </div>
              </div>
            </article>
          </div>

          <div className="flex justify-center items-center gap-2 mt-6">
            {reviewCards.map((_, dot) => (
              <button
                key={dot}
                type="button"
                onClick={() => setActiveReviewIndex(dot)}
                className={`w-2 h-2 rounded-full ${dot === activeReviewIndex ? 'bg-gray-700' : 'bg-gray-300'}`}
                aria-label={`Go to review ${dot + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        className="w-full min-h-[500px] sm:min-h-[620px] flex items-center justify-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(20,24,35,.45), rgba(20,24,35,.45)), url('/lookingForGreatConnection.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="relative z-10 max-w-3xl text-center px-6 py-12">
          <h3 className="text-3xl sm:text-5xl font-bold text-white mb-3">
            Ready to make meaningful connections?
          </h3>
          <p className="text-white/95 text-sm sm:text-base leading-relaxed mb-6">
            Sign up to explore profiles and begin dating online. Enjoy 24/7 chatting on our
            interactive platform and connect instantly with singles worldwide. Discover matches
            with ease and experience virtual relationships in a fun and engaging way!
          </p>
          <Link
            to="/signup-email"
            className="inline-block text-white font-semibold px-10 py-3 rounded-md hover:opacity-90 transition"
            style={{ background: 'linear-gradient(to right, #5A2D8A, #B5458F, #E97672)' }}
          >
            Take a chance!
          </Link>
        </div>
      </section>

      {/* Relationship experts section */}
      <section className="w-full bg-white px-4 sm:px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">
            We&apos;re Partnering with Relationship Experts
          </h3>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Dating.com collaborates with top specialists to ensure our platform remains engaging, fun,
            and provides members with a meaningful and enjoyable virtual dating experience.
          </p>

          <div className="grid gap-10 md:grid-cols-3">
            {/* Jaime Bronstein */}
            <article className="bg-white rounded-3xl shadow-md border border-gray-200 overflow-hidden flex flex-col h-full">
              <div className="w-full aspect-[4/3] overflow-hidden">
                <img
                  src="/profile.png"
                  alt="Jaime Bronstein"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="px-6 pt-6 pb-7 flex flex-col flex-1">
                <h4 className="text-xl font-semibold text-center text-gray-900 mb-2">Jaime Bronstein</h4>
                <p className="text-xs sm:text-sm text-gray-500 text-center mb-4">
                  Jaime is a highly experienced relationship coach, recognized by Yahoo Finance as
                  &ldquo;The #1 Relationship Coach Transforming Lives&rdquo;.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  For over 20 years, Jaime has guided singles, couples, and those navigating breakups and
                  divorces. She helps clients realize that they are meant to experience love&mdash;not just any
                  love, but the love that truly suits them.
                </p>
              </div>
            </article>

            {/* Sabrina Bendory */}
            <article className="bg-white rounded-3xl shadow-md border border-gray-200 overflow-hidden flex flex-col h-full">
              <div className="w-full aspect-[4/3] overflow-hidden">
                <img
                  src="/profile.png"
                  alt="Sabrina Bendory"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="px-6 pt-6 pb-7 flex flex-col flex-1">
                <h4 className="text-xl font-semibold text-center text-gray-900 mb-2">Sabrina Bendory</h4>
                <p className="text-xs sm:text-sm text-gray-500 text-center mb-4">
                  Sabrina is a globally recognized dating and relationship expert, best-selling author, and
                  host of the You Will Be OK podcast.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  With more than 15 years of experience, Sabrina has supported millions of women in building
                  self-confidence, breaking harmful patterns, and finding lasting love. Her book
                  &ldquo;You&apos;re Overthinking It&rdquo; has become an essential guide for modern dating, and
                  her TikTok and Instagram content continues to inspire and empower women worldwide.
                </p>
              </div>
            </article>

            {/* Bela Gandhi */}
            <article className="bg-white rounded-3xl shadow-md border border-gray-200 overflow-hidden flex flex-col h-full">
              <div className="w-full aspect-[4/3] overflow-hidden">
                <img
                  src="/profile.png"
                  alt="Bela Gandhi"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="px-6 pt-6 pb-7 flex flex-col flex-1">
                <h4 className="text-xl font-semibold text-center text-gray-900 mb-2">Bela Gandhi</h4>
                <p className="text-xs sm:text-sm text-gray-500 text-center mb-4">
                  Bela is a relationship coach and founder of Smart Dating Academy, known for her Foolproof
                  System for identifying ideal partner qualities (GPQ&reg;).
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  With 15+ years guiding people through relationships, Bela has helped countless couples
                  achieve happiness. Her expertise has earned her the nickname &ldquo;Fairy Godmother of
                  Love&rdquo; by Steve Harvey and Good Morning America.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Our Shared Journey — full-width slider */}
      <section
        className="w-full relative min-h-[520px] sm:min-h-[620px] flex flex-col items-center justify-center overflow-hidden"
        style={{
          backgroundImage: "url('/OurSharedSuccess.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* subtle overlay to improve readability */}
        <div className="absolute inset-0 bg-slate-700/20 pointer-events-none" />

        <div className="relative z-10 w-full px-4 sm:px-6 py-10 flex flex-col items-center">
          <h3 className="text-2xl sm:text-4xl font-bold text-white text-center mb-3">
            Our Shared Journey
          </h3>
          <p className="text-white/90 text-sm sm:text-base text-center max-w-xl mx-auto leading-relaxed mb-10">
            Vantage Dating is dedicated to reducing loneliness by encouraging virtual closeness
            and meaningful online connections. Join us today and take your first step toward
            meeting the right match online.
          </p>

          {/* Three-card slider */}
          <div className="w-full max-w-6xl flex items-center justify-center gap-4 sm:gap-6">
            {/* Left muted card */}
            <article className="flex-[1.1] min-w-0 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 sm:p-8 min-h-[220px] sm:min-h-[260px] flex flex-col justify-center text-center">
              <h4 className="text-lg sm:text-2xl font-semibold text-white mb-1">
                {journeySlides[getJourneyIndex(-1)].heading}
              </h4>
              <p className="text-sm sm:text-base text-white/80">
                {journeySlides[getJourneyIndex(-1)].sub}
              </p>
            </article>

            {/* Left arrow */}
            <button
              type="button"
              onClick={() => setActiveJourneyIndex(getJourneyIndex(-1))}
              className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/60 bg-white/10 text-white hover:bg-white/25 transition inline-flex items-center justify-center"
              aria-label="Previous"
            >
              <FaChevronLeft className="text-xs" />
            </button>

            {/* Center prominent card */}
            <article className="flex-[1.4] min-w-0 bg-white rounded-2xl p-7 sm:p-12 min-h-[260px] sm:min-h-[320px] flex flex-col justify-center text-center shadow-xl">
              <h4 className="text-3xl sm:text-5xl font-bold text-gray-800 mb-2">
                {journeySlides[activeJourneyIndex].heading}
              </h4>
              <p className="text-base sm:text-2xl text-gray-600">
                {journeySlides[activeJourneyIndex].sub}
              </p>
            </article>

            {/* Right arrow */}
            <button
              type="button"
              onClick={() => setActiveJourneyIndex(getJourneyIndex(1))}
              className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/60 bg-white/10 text-white hover:bg-white/25 transition inline-flex items-center justify-center"
              aria-label="Next"
            >
              <FaChevronRight className="text-xs" />
            </button>

            {/* Right muted card */}
            <article className="flex-[1.1] min-w-0 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 sm:p-8 min-h-[220px] sm:min-h-[260px] flex flex-col justify-center text-center">
              <h4 className="text-lg sm:text-2xl font-semibold text-white mb-1">
                {journeySlides[getJourneyIndex(1)].heading}
              </h4>
              <p className="text-sm sm:text-base text-white/80">
                {journeySlides[getJourneyIndex(1)].sub}
              </p>
            </article>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center items-center gap-2 mt-6">
            {journeySlides.map((_, dot) => (
              <button
                key={`journey-dot-${dot}`}
                type="button"
                onClick={() => setActiveJourneyIndex(dot)}
                className={`w-2 h-2 rounded-full transition ${dot === activeJourneyIndex ? 'bg-white' : 'bg-white/40'}`}
                aria-label={`Go to slide ${dot + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-white px-4 sm:px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-3">
            Online Dating Insights
          </h3>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Looking for guidance on online dating or tips to perfect your profile?
            Get matched smarter with expert-backed advice designed to help you build meaningful virtual connections.
            Turn your next online relationship into a success with real-world experience.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {insightsCards.map((card) => (
              <article key={card.title} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-48 object-cover object-top"
                />
                <div className="p-5">
                  <h4 className="text-3xl font-semibold text-gray-900 mb-3 leading-tight">
                    {card.title}
                  </h4>
                  <p className="text-gray-600 text-lg leading-relaxed mb-5">
                    {card.text}
                  </p>
                  <div className="flex items-center justify-between gap-3 text-sm text-gray-500 whitespace-nowrap">
                    <span className="truncate">By {card.author}</span>
                    <span className="shrink-0">{card.date}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#2f3136] text-white py-10 border-t border-white/10">
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
              <li><a href="#" className="hover:text-white">About</a></li>
              <li><a href="#" className="hover:text-white">Investments/M&A</a></li>
              <li><a href="#" className="hover:text-white">Become a Partner</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-white/70 text-base">
              <li><a href="#" className="hover:text-white">Help Center</a></li>
              <li><a href="#" className="hover:text-white">Dating Securely</a></li>
              <li><a href="#" className="hover:text-white">Online dating advice</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Conditions</h4>
            <ul className="space-y-3 text-white/70 text-base">
              <li><Link to="/terms" className="hover:text-white">Terms &amp; Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-white">Privacy policy</Link></li>
              <li><Link to="/refund" className="hover:text-white">Cookie Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Search for singles</h4>
            <ul className="space-y-3 text-white/70 text-base">
              <li><a href="#" className="hover:text-white">Mature Singles Dating Online</a></li>
              <li><a href="#" className="hover:text-white">Asian Singles Dating Online</a></li>
              <li><a href="#" className="hover:text-white">Gay Singles Dating Online</a></li>
              <li><a href="#" className="hover:text-white">User Reviews Dating Online</a></li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

