import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link
              to="/"
              className="inline-block text-2xl font-extrabold tracking-tight text-white transition hover:text-teal-400"
            >
              Stay<span className="text-teal-400">Sync</span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              Find comfortable, affordable and suitable PGs, rooms and
              stays for your next move.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                className="rounded-lg border border-slate-800 px-3 py-2 text-sm text-slate-400 transition hover:border-teal-500 hover:text-teal-400"
              >
                Instagram
              </a>

              <a
                href="#"
                className="rounded-lg border border-slate-800 px-3 py-2 text-sm text-slate-400 transition hover:border-teal-500 hover:text-teal-400"
              >
                LinkedIn
              </a>

              <a
                href="#"
                className="rounded-lg border border-slate-800 px-3 py-2 text-sm text-slate-400 transition hover:border-teal-500 hover:text-teal-400"
              >
                Twitter
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Explore
            </h3>

            <ul className="mt-5 space-y-3">
              <li>
                <Link
                  to="/properties"
                  className="text-sm text-slate-400 transition hover:text-teal-400"
                >
                  Find PGs
                </Link>
              </li>

              <li>
                <Link
                  to="/properties"
                  className="text-sm text-slate-400 transition hover:text-teal-400"
                >
                  Find Rooms
                </Link>
              </li>

              <li>
                <Link
                  to="/roommates"
                  className="text-sm text-slate-400 transition hover:text-teal-400"
                >
                  Find Roommates
                </Link>
              </li>

              <li>
                <Link
                  to="/properties"
                  className="text-sm text-slate-400 transition hover:text-teal-400"
                >
                  Popular Locations
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Company
            </h3>

            <ul className="mt-5 space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-sm text-slate-400 transition hover:text-teal-400"
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  to="/"
                  className="text-sm text-slate-400 transition hover:text-teal-400"
                >
                  Contact Us
                </Link>
              </li>

              <li>
                <Link
                  to="/"
                  className="text-sm text-slate-400 transition hover:text-teal-400"
                >
                  Help Center
                </Link>
              </li>

              <li>
                <Link
                  to="/owner/add-property"
                  className="text-sm text-slate-400 transition hover:text-teal-400"
                >
                  List Your Property
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Legal
            </h3>

            <ul className="mt-5 space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-sm text-slate-400 transition hover:text-teal-400"
                >
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link
                  to="/"
                  className="text-sm text-slate-400 transition hover:text-teal-400"
                >
                  Terms & Conditions
                </Link>
              </li>

              <li>
                <Link
                  to="/"
                  className="text-sm text-slate-400 transition hover:text-teal-400"
                >
                  Cookie Policy
                </Link>
              </li>

              <li>
                <Link
                  to="/"
                  className="text-sm text-slate-400 transition hover:text-teal-400"
                >
                  Safety Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-slate-800 pt-7">
          <div className="flex flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} StaySync. All rights reserved.
            </p>

            <p>
              Made for students & professionals 🏠
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;