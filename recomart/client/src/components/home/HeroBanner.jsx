import { Link } from 'react-router-dom';
import { ShoppingBag, Sparkles, Star, TrendingUp } from 'lucide-react';

const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-violet-600 text-white">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white" />
        <div className="absolute top-40 right-20 w-24 h-24 rounded-full bg-white" />
        <div className="absolute bottom-10 left-1/3 w-20 h-20 rounded-full bg-white" />
        <div className="absolute bottom-20 right-1/4 w-16 h-16 rounded-full bg-white" />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered Shopping</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Discover Amazing Products
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-lg">
              Experience personalized shopping with AI-powered recommendations
              tailored just for you. Find exactly what you need, every time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                Shop Now
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/50 text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors"
              >
                Browse Categories
              </Link>
            </div>
          </div>

          <div className="flex-1 z-10 hidden lg:flex items-center justify-center">
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-3xl rotate-6" />
              <div className="absolute inset-0 bg-white/15 backdrop-blur-sm rounded-3xl -rotate-3" />
              <div className="absolute inset-4 bg-white/20 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center gap-6">
                <ShoppingBag className="w-20 h-20 text-white/80" />
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                    <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                    <span className="text-sm font-medium">Top Rated</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">Trending</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center"
                    >
                      <ShoppingBag className="w-6 h-6 text-white/70" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
