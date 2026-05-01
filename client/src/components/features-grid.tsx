import { Link } from "wouter";

export default function FeaturesGrid() {
  const features = [
    {
      href: "/disease-prediction",
      icon: "fas fa-stethoscope",
      title: "Disease Prediction",
      description: "AI-powered disease prediction using RandomForest Classifier based on symptoms",
      color: "primary",
      cta: "Start Diagnosis"
    },
    {
      href: "/drug-recommendation",
      icon: "fas fa-pills",
      title: "Drug Finder",
      description: "NLP & cosine similarity for accurate alternative medicine matching",
      color: "accent",
      cta: "Find Alternatives"
    },
    {
      href: "/heart-assessment",
      icon: "fas fa-heart",
      title: "Heart Risk",
      description: "ML-based heart disease risk assessment using lifestyle factors",
      color: "destructive",
      cta: "Assess Risk"
    }
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Comprehensive AI Healthcare Solutions</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our platform combines cutting-edge AI technologies to deliver personalized healthcare intelligence
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            return (
            <Link key={index} href={feature.href}>
              <div 
                className="bg-white rounded-2xl p-8 card-hover cursor-pointer h-full flex flex-col border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                data-testid={`card-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <i className={`${feature.icon} text-2xl`}></i>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 font-medium text-base mb-6 flex-grow">
                  {feature.description}
                </p>
                <div className="flex items-center text-blue-600 font-bold group">
                  <span>{feature.cta}</span>
                  <i className="fas fa-arrow-right ml-2 transform group-hover:translate-x-1 transition-transform"></i>
                </div>
              </div>
            </Link>
          )})}
        </div>
      </div>
    </section>
  );
}
