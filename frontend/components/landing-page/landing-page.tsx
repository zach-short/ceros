import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';

/**
 * 1. REUSABLE ANIMATION COMPONENT
 * This wrapper triggers the fade-in/slide-up animation
 * when the element enters the viewport.
 */
const RevealOnScroll = ({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Only animate once
        }
      },
      { threshold: 0.1 }, // Trigger when 10% is visible
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default function LandingPage({
  onLoginClick,
}: {
  onLoginClick: () => void;
}) {
  return (
    <div className='min-h-screen w-full'>
      <div className='relative w-full min-h-screen bg-gradient-to-br from-blue-600 via-orange-500 via-yellow-100 to-yellow-300 overflow-hidden'>
        {/* ANIMATED BACKGROUND ELEMENTS */}
        <div className='absolute inset-0 pointer-events-none overflow-hidden'>
          <span
            className='absolute top-0 left-0 h-96 w-96 rounded-full bg-blue-400 opacity-20 blur-3xl animate-pulse'
            style={{ animationDuration: '8s' }}
          />
          <span
            className='absolute top-1/4 right-0 h-[500px] w-[500px] rounded-full bg-pink-400 opacity-20 blur-3xl animate-pulse'
            style={{ animationDuration: '10s', animationDelay: '2s' }}
          />
          <span
            className='absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-orange-300 opacity-20 blur-3xl animate-pulse'
            style={{ animationDuration: '12s', animationDelay: '4s' }}
          />
        </div>

        <div className='relative z-10 flex flex-col'>
          <section className='min-h-[90vh] flex flex-col lg:flex-row items-center justify-between px-4 md:px-8 lg:px-16 xl:px-24 pt-16 pb-8 max-w-[1800px] mx-auto w-full'>
            <div className='flex-1 text-left max-w-3xl mb-8 lg:mb-0'>
              <RevealOnScroll>
                <h1 className='text-5xl text-black md:text-6xl font-bold leading-tight mb-6'>
                  <span>Meeting</span>
                  <br />
                  <span>infrastructure</span>
                  <br />
                  <span>to grow your</span>
                  <br />
                  <span>productivity</span>
                </h1>

                <p className='text-lg md:text-xl lg:text-2xl text-gray-800 mb-8 max-w-2xl leading-relaxed'>
                  Use Ceros to run efficient RONR meetings, collaborate
                  seamlessly, and make decisions faster.
                </p>

                <div className='flex flex-col sm:flex-row gap-4 mb-4'>
                  <Button
                    className='h-14 px-8 text-lg bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all'
                    onClick={onLoginClick}
                  >
                    Start now →
                  </Button>
                  <Link href={`/docs/api`}>
                    <button className='w-full h-14 px-8 text-lg bg-white/90 hover:bg-white text-gray-900 rounded-full shadow-lg hover:shadow-xl transition-all border border-gray-200'>
                      Documentation
                    </button>
                  </Link>
                </div>
              </RevealOnScroll>
            </div>

            <div className='flex-1 flex items-center justify-center lg:justify-end w-full max-w-2xl'>
              <RevealOnScroll delay={200}>
                <div className='relative w-full max-w-md lg:max-w-lg xl:max-w-xl'>
                  <div className='bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-2 border border-white/20 max-[580px]:hidden'>
                    <Image
                      src='/images/chat.png'
                      alt='Product mockup placeholder'
                      width={800}
                      height={600}
                      className='w-full h-auto rounded-2xl shadow-lg'
                    />
                  </div>

                  <div className='absolute -bottom-16 -left-8 w-32 md:w-36 lg:w-40 max-[580px]:hidden'>
                    <div className='bg-white/10 backdrop-blur-md rounded-[.8rem] shadow-2xl p-1 border border-white/20'>
                      <div className='bg-white rounded-[.8rem] overflow-hidden aspect-[9/18] relative'>
                        <Image
                          src='/images/phone.jpg'
                          alt='Mobile app screenshot'
                          fill
                          className='object-cover'
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          </section>

          <section className='min-h-screen bg-gradient-to-b from-transparent to-white/20 py-20 px-4 md:px-8 lg:px-16'>
            <div className='max-w-7xl mx-auto'>
              <RevealOnScroll>
                <div className='text-center mb-16'>
                  <div className='inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-4'>
                    <span className='text-gray-900 font-medium'>Workflow</span>
                  </div>
                  <h2 className='text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6'>
                    Collaborate, command,
                    <br />
                    and organize
                  </h2>
                  <p className='text-xl text-gray-800 max-w-3xl mx-auto'>
                    Everything you need to run efficient meetings, whether
                    organizing committees, managing motions, or connecting with
                    your team.
                  </p>
                </div>
              </RevealOnScroll>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-20'>
                <RevealOnScroll delay={100}>
                  <div className='bg-white/30 backdrop-blur-md rounded-2xl p-8 border border-white/40 hover:bg-white/40 transition-all hover:shadow-xl'>
                    <div className='w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4'>
                      <svg
                        className='w-6 h-6 text-white'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M13 10V3L4 14h7v7l9-11h-7z'
                        />
                      </svg>
                    </div>
                    <h3 className='text-2xl font-bold text-gray-900 mb-3'>
                      Powerful & flexible
                    </h3>
                    <p className='text-gray-800'>
                      Create committees, manage motions, and run meetings that
                      follow Robert&apos;s Rules of Order with ease.
                    </p>
                  </div>
                </RevealOnScroll>

                <RevealOnScroll delay={200}>
                  <div className='bg-white/30 backdrop-blur-md rounded-2xl p-8 border border-white/40 hover:bg-white/40 transition-all hover:shadow-xl'>
                    <div className='w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mb-4'>
                      <svg
                        className='w-6 h-6 text-white'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'
                        />
                      </svg>
                    </div>
                    <h3 className='text-2xl font-bold text-gray-900 mb-3'>
                      Built for collaboration
                    </h3>
                    <p className='text-gray-800'>
                      Real-time chat, voting, and decision-making tools that
                      keep your team aligned and productive.
                    </p>
                  </div>
                </RevealOnScroll>

                <RevealOnScroll delay={300}>
                  <div className='bg-white/30 backdrop-blur-md rounded-2xl p-8 border border-white/40 hover:bg-white/40 transition-all hover:shadow-xl'>
                    <div className='w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4'>
                      <svg
                        className='w-6 h-6 text-white'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                        />
                      </svg>
                    </div>
                    <h3 className='text-2xl font-bold text-gray-900 mb-3'>
                      Secure by default
                    </h3>
                    <p className='text-gray-800'>
                      Your meeting data is protected with enterprise-grade
                      security and privacy controls.
                    </p>
                  </div>
                </RevealOnScroll>
              </div>

              {/* COMMITTEE SHOWCASE */}
              <RevealOnScroll>
                <div className='bg-white/40 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/50 shadow-2xl mb-20'>
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
                    <div>
                      <h3 className='text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6'>
                        Organize committees effortlessly
                      </h3>
                      <p className='text-lg text-gray-800 mb-6 leading-relaxed'>
                        Connect with friends, bring your team together, and
                        create committees for structured online meetings. Manage
                        members, assign roles, and maintain parliamentary
                        procedure.
                      </p>
                      <ul className='space-y-3'>
                        <li className='flex items-start gap-3'>
                          <span className='text-green-600 mt-1'>✓</span>
                          <span className='text-gray-800'>
                            Invite members and manage permissions
                          </span>
                        </li>
                        <li className='flex items-start gap-3'>
                          <span className='text-green-600 mt-1'>✓</span>
                          <span className='text-gray-800'>
                            Track attendance and participation
                          </span>
                        </li>
                        <li className='flex items-start gap-3'>
                          <span className='text-green-600 mt-1'>✓</span>
                          <span className='text-gray-800'>
                            Maintain meeting history and records
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className='flex justify-center'>
                      <Image
                        src='/images/committee.png'
                        alt='Committee management'
                        width={600}
                        height={500}
                        className='w-full max-w-md rounded-2xl shadow-xl hover:scale-105 transition-transform duration-500'
                      />
                    </div>
                  </div>
                </div>
              </RevealOnScroll>

              {/* CHAT SHOWCASE */}
              <RevealOnScroll>
                <div className='bg-white/40 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/50 shadow-2xl'>
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
                    <div className='order-2 lg:order-1 flex justify-center'>
                      <Image
                        src='/images/group-chat.png'
                        alt='Group messaging'
                        width={600}
                        height={500}
                        className='w-full max-w-md rounded-2xl shadow-xl hover:scale-105 transition-transform duration-500'
                      />
                    </div>
                    <div className='order-1 lg:order-2'>
                      <h3 className='text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6'>
                        Streamlined communication
                      </h3>
                      <p className='text-lg text-gray-800 mb-6 leading-relaxed'>
                        Connect instantly with your team through fast, private
                        messaging. Create motions, discuss proposals, and
                        vote—all within the same platform.
                      </p>
                      <ul className='space-y-3'>
                        <li className='flex items-start gap-3'>
                          <span className='text-green-600 mt-1'>✓</span>
                          <span className='text-gray-800'>
                            Real-time chat and notifications
                          </span>
                        </li>
                        <li className='flex items-start gap-3'>
                          <span className='text-green-600 mt-1'>✓</span>
                          <span className='text-gray-800'>
                            Motion creation and voting tools
                          </span>
                        </li>
                        <li className='flex items-start gap-3'>
                          <span className='text-green-600 mt-1'>✓</span>
                          <span className='text-gray-800'>
                            Threaded discussions for clarity
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          </section>

          {/* FINAL CTA SECTION */}
          <section className='bg-gradient-to-b from-white/20 to-white/40 py-24 px-4'>
            <RevealOnScroll>
              <div className='max-w-4xl mx-auto text-center'>
                <h2 className='text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6'>
                  Ready to transform your meetings?
                </h2>
                <p className='text-xl text-gray-800 mb-10 max-w-2xl mx-auto'>
                  Join the Ceros community and experience the future of
                  collaborative decision-making.
                </p>
                <Button
                  className='h-16 px-12 text-xl bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1'
                  onClick={onLoginClick}
                >
                  Get started →
                </Button>
              </div>
            </RevealOnScroll>
          </section>
        </div>
      </div>
    </div>
  );
}
