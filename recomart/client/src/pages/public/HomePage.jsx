import HeroBanner from '../../components/home/HeroBanner';
import CategoryGrid from '../../components/home/CategoryGrid';
import FeaturedProducts from '../../components/home/FeaturedProducts';
import TrendingProducts from '../../components/home/TrendingProducts';
import RecommendedProducts from '../../components/home/RecommendedProducts';

const HomePage = () => {
  return (
    <div>
      <HeroBanner />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="py-12">
          <CategoryGrid />
        </section>
        <section className="py-12">
          <FeaturedProducts />
        </section>
        <section className="py-12">
          <TrendingProducts />
        </section>
        <section className="py-12">
          <RecommendedProducts />
        </section>
      </div>
    </div>
  );
};

export default HomePage;
