export default function Footer() {
  return (
    <footer className="border-t border-[#DBEAFE] bg-[#F8FAFC] py-14">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-8 text-center sm:grid-cols-3 sm:text-left">
          <div>
            <p className="text-lg font-bold text-[#102A43]">Child Compass™</p>
            <p className="mt-2 text-sm text-[#486581]">A VYRONSOFT product.</p>
            <p className="mt-4 text-xs text-[#627D98]">
              Family-centred support for understanding, progress and confidence.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#829AB1]">Support</p>
            <ul className="mt-3 space-y-2 text-sm text-[#486581]">
              <li><a href="/help" className="transition-colors hover:text-[#2F80ED]">Help Centre</a></li>
              <li><a href="/help/faq" className="transition-colors hover:text-[#2F80ED]">FAQ</a></li>
              <li><a href="/help/contact" className="transition-colors hover:text-[#2F80ED]">Contact</a></li>
              <li><a href="/help/status" className="transition-colors hover:text-[#2F80ED]">System Status</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#829AB1]">Legal</p>
            <ul className="mt-3 space-y-2 text-sm text-[#486581]">
              <li><a href="/help/privacy" className="transition-colors hover:text-[#2F80ED]">Privacy Centre</a></li>
              <li><a href="/help/terms" className="transition-colors hover:text-[#2F80ED]">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-[#829AB1]">© {new Date().getFullYear()} VYRONSOFT. All rights reserved.</p>
      </div>
    </footer>
  );
}
