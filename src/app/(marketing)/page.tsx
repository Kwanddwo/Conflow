import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="w-full overflow-clip">
      <section className="relative w-full h-[500px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/ensakh.png')`,
            backgroundBlendMode: "overlay",
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 max-w-4xl leading-tight">
            Manage your conference with ease.
          </h1>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="bg-[#0f172a] text-white hover:bg-[#0f172a]/90 px-8 py-3 text-lg cursor-pointer"
            >
              Learn More
            </Button>
            <Link href="/sign-up">
              <Button
                size="lg"
                variant="outline"
                className="bg-white text-black border-white hover:bg-gray-200 px-8 py-3 text-lg cursor-pointer"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-50" />

      <footer className="flex flex-col justify-between gap-4 py-6 border-border border-t-1">
        <div className="flex justify-between flex-wrap px-5.5">
          <div>
            <Logo height={32} width={110} />
            <p>A simplified conference manager.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="w-36">
              <p className="typography-large">Learn</p>
              <ul className="flex flex-col gap-2 mt-2">
                <li>
                  <Link href="#">Guides</Link>
                </li>
                <li>
                  <Link href="#">Tutorials</Link>
                </li>
              </ul>
            </div>
            <div className="w-36">
              <p className="typography-large">Resources</p>
              <ul className="flex flex-col gap-2 mt-2">
                <li>
                  <Link href="#">Documentation</Link>
                </li>
                <li>
                  <Link href="#">Github</Link>
                </li>
              </ul>
            </div>
            <div className="w-36">
              <p className="typography-large">Legal</p>
              <ul className="flex flex-col gap-2 mt-2">
                <li>
                  <Link href="#">Terms of Service</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center p-4 border-t-1 border-border">
          <p className="typography-muted">
            © 2025 chairio. Built with ❤️ by Marouane Lemghari & Aymane
            Derrouich.
          </p>
        </div>
      </footer>
    </div>
  );
}
