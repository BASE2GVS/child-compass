export default function Footer() {
  return (
    <footer className="border-t border-slate-200/60 bg-white py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-8 text-center sm:grid-cols-3 sm:text-left">
          <div>
            <p className="text-lg font-bold text-[#0F172A]">Child Compass™</p>
            <p className="mt-2 text-sm text-slate-500">A VYRONSOFT product.</p>
            <p className="mt-4 text-xs text-slate-400">
              Practical support for PDA, Autism, ADHD and Anxiety families.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Support</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><a href="/help" className="hover:text-[#14B8A6]">Help Centre</a></li>
              <li><a href="/help/faq" className="hover:text-[#14B8A6]">FAQ</a></li>
              <li><a href="/help/contact" className="hover:text-[#14B8A6]">Contact</a></li>
              <li><a href="/help/status" className="hover:text-[#14B8A6]">System Status</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Legal</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><a href="/help/privacy" className="hover:text-[#14B8A6]">Privacy Centre</a></li>
              <li><a href="/help/terms" className="hover:text-[#14B8A6]">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-slate-400">© {new Date().getFullYear()} VYRONSOFT. All rights reserved.</p>
      </div>
    </footer>
  );
}
