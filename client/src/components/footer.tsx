import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-heartbeat text-primary-foreground text-lg"></i>
              </div>
              <span className="text-xl font-bold text-foreground">HealthAI</span>
            </div>
            <p className="text-muted-foreground text-sm">
              AI-Powered Healthcare Intelligence Network providing accurate disease predictions and personalized medical recommendations.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-card-foreground mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/disease-prediction" className="hover:text-foreground transition-colors">
                  Disease Prediction
                </Link>
              </li>
              <li>
                <Link href="/drug-recommendation" className="hover:text-foreground transition-colors">
                  Drug Finder
                </Link>
              </li>
              <li>
                <Link href="/heart-assessment" className="hover:text-foreground transition-colors">
                  Heart Risk Assessment
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-card-foreground mb-4">Technology</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Machine Learning</li>
              <li>Natural Language Processing</li>
              <li>Vector Databases</li>
              <li>MERN Stack</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-card-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Medical Disclaimer</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">HIPAA Compliance</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 AI Healthcare Intelligence Network. All rights reserved. This platform is for informational purposes only.</p>
        </div>
      </div>
    </footer>
  );
}
