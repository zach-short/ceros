import { Button } from "@/components/ui/button"

export default function Demo() {
  return (
    <div className="min-h-screen w-full">

      <div className="relative w-full min-h-screen bg-gradient-to-br from-sky-100 via-emerald-50 to-slate-100 overflow-hidden">

        <span className="pointer-events-none absolute -top-24 left-10 h-48 w-48 md:h-72 md:w-72 rounded-full bg-sky-200 opacity-40 blur-3xl" />
        <span className="pointer-events-none absolute top-1/3 right-0 h-60 w-60 md:h-80 md:w-80 rounded-full bg-emerald-200 opacity-40 blur-3xl" />
        <span className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 md:h-64 md:w-64 rounded-full bg-indigo-200 opacity-30 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-20 -right-10 h-56 w-56 md:h-72 md:w-72 rounded-full bg-purple-200 opacity-30 blur-3xl" />

        <div className="relative z-10 flex flex-col">

          <section className="min-h-[80vh] flex flex-col items-center justify-center px-4 pt-8 text-center">
            <img src="/images/logo.png" alt="Ceros Logo" className="mx-auto mb-4 max-w-[150px] md:max-w-none" />
            
            <div className="text-5xl md:text-8xl font-semibold">Ceros</div>
            
            <div className="text-xl md:text-4xl font-medium mt-4 md:mt-2 px-4">
              The chat-based solution for RONR meetings
            </div>

            {/* Stack buttons on mobile (flex-col), side-by-side on desktop (md:flex-row) */}
            <div className="flex flex-col md:flex-row justify-center items-center mt-10 gap-4 md:gap-6 w-full">
              <Button className="h-16 md:h-20 w-full md:w-48 text-xl md:text-2xl bg-green-200 hover:bg-green-300 text-black rounded-3xl shadow-lg">
                Get Started
              </Button>
              <Button className="h-16 md:h-20 w-full md:w-52 text-xl md:text-2xl bg-gray-300 hover:bg-gray-400 text-black rounded-3xl shadow-lg">
                Documentation
              </Button>
            </div>
          </section>

          <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center py-10">
            <h1 className="text-3xl md:text-5xl mb-8 md:mb-12 font-medium px-2">
              Add friends and create committees for online meetings.
            </h1>
            
            <div className="w-full md:w-[80%] max-w-6xl bg-white/70 backdrop-blur-md border border-black rounded-3xl shadow-lg flex flex-col md:flex-row items-center justify-center overflow-hidden p-6 md:p-0">
              
              <img src="/images/construction.png" className="w-full max-w-[200px] md:max-w-none md:max-h-[70%] md:ml-auto mb-6 md:mb-0 object-contain" alt="Construction" />
              
              {/* Text Wrapper: Full width on mobile, 40% on desktop */}
              <div className="flex flex-col justify-center w-full md:w-[40%] md:mr-4 md:ml-auto text-center md:text-left">
                <h2 className="text-xl md:text-3xl font-medium">
                  Connect with friends, bring your team together, and effortlessly create committees…
                </h2>
              </div>
            </div>
          </section>

          {/* --- Feature Section 2 --- */}
          <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center py-10">
            <h1 className="text-3xl md:text-5xl mb-8 md:mb-12 font-medium px-2">
              Collaboration Tools for Every Kind of Discussion
            </h1>
            <div className="w-full md:w-[80%] max-w-6xl bg-white/70 backdrop-blur-md border border-black rounded-3xl shadow-lg flex flex-col md:flex-row items-center justify-center overflow-hidden p-6 md:p-0">
              <img src="/images/construction.png" className="w-full max-w-[200px] md:max-w-none md:max-h-[70%] md:ml-auto mb-6 md:mb-0 object-contain" alt="Construction" />
              <div className="flex flex-col justify-center w-full md:w-[40%] md:mr-4 md:ml-auto text-center md:text-left">
                <h2 className="text-xl md:text-3xl font-medium">
                  Streamline your committee work with motion creation, discussions, and voting…
                </h2>
              </div>
            </div>
          </section>

          {/* --- Feature Section 3 --- */}
          <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center py-10">
            <h1 className="text-3xl md:text-5xl mb-8 md:mb-12 font-medium px-2">
              Join the Ceros Community!
            </h1>
            <div className="w-full md:w-[80%] max-w-6xl bg-white/70 backdrop-blur-md border border-black rounded-3xl shadow-lg flex flex-col md:flex-row items-center justify-center overflow-hidden p-6 md:p-0">
              <img src="/images/construction.png" className="w-full max-w-[200px] md:max-w-none md:max-h-[70%] md:ml-auto mb-6 md:mb-0 object-contain" alt="Construction" />
              <div className="flex flex-col justify-center w-full md:w-[40%] md:mr-4 md:ml-auto text-center md:text-left">
                <h2 className="text-xl md:text-3xl font-medium">
                  Connect instantly with friends through fast, private direct messaging…
                </h2>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}