import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-slate-900">
            Healthcare Intelligence
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Leveraging Machine Learning and NLP to provide accurate disease predictions, 
            personalized medical recommendations, and assisted healthcare solutions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/disease-prediction">
              <button 
                className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-md"
                data-testid="button-start-assessment"
              >
                Start Health Assessment
              </button>
            </Link>
            <Link href="/heart-assessment">
              <button 
                className="w-full sm:w-auto bg-white border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
                data-testid="button-learn-more"
              >
                Check Heart Risk
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
