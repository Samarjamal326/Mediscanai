import { Link, useLocation } from "wouter";

export default function Navbar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/disease-prediction", label: "Disease Prediction" },
    { href: "/drug-recommendation", label: "Drug Finder" },
    { href: "/heart-assessment", label: "Heart Risk" },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
              <i className="fas fa-heartbeat text-blue-600 text-3xl"></i>
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">HealthAI</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${
                  location === item.href
                    ? "text-primary font-medium"
                    : "text-foreground hover:text-primary"
                }`}
                data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center space-x-4">
            <button 
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              data-testid="button-profile"
            >
              <i className="fas fa-user mr-2"></i>Profile
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
