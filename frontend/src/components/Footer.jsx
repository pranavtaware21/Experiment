import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border/50 mt-auto bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">SS</span>
              </div>
              <span className="text-lg font-bold text-text-dark font-[Raleway]">
                Survey<span className="text-primary">Swap</span>
              </span>
            </div>
            <p className="text-sm text-text/70 max-w-md leading-relaxed">
              The #1 survey exchange for researchers and students. Answer surveys to earn credits, use credits to get real responses.
            </p>
          </div>

          <div>
            <h4 className="text-text-dark font-semibold mb-3 text-sm">Platform</h4>
            <ul className="space-y-2 list-none p-0">
              <li><Link to="/surveys" className="hover:text-text-dark transition-colors no-underline text-text/60 text-sm">Earn Credits</Link></li>
              <li><Link to="/add-survey" className="hover:text-text-dark transition-colors no-underline text-text/60 text-sm">Post a Survey</Link></li>
              <li><Link to="/dashboard" className="hover:text-text-dark transition-colors no-underline text-text/60 text-sm">Dashboard</Link></li>
              <li><Link to="/signup" className="hover:text-text-dark transition-colors no-underline text-text/60 text-sm">Sign Up Free</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-text-dark font-semibold mb-3 text-sm">Company</h4>
            <ul className="space-y-2 list-none p-0">
              <li><span className="cursor-pointer hover:text-text-dark transition-colors text-text/60 text-sm">About</span></li>
              <li><span className="cursor-pointer hover:text-text-dark transition-colors text-text/60 text-sm">Privacy Policy</span></li>
              <li><span className="cursor-pointer hover:text-text-dark transition-colors text-text/60 text-sm">Terms of Service</span></li>
              <li><span className="cursor-pointer hover:text-text-dark transition-colors text-text/60 text-sm">Contact</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-6 text-center text-xs text-text/40">
          <p>&copy; {new Date().getFullYear()} SurveySwap. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
