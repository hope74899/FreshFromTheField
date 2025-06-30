import HeroSection from "../../components/Common/Home/HeroSection";
import BlogSection from "../../components/Common/Home/BlogSection";
import LatestProducts from "../../components/Common/Home/LatestProducts";
import FarmerBestProduct from "../../components/Common/Home/FarmerBestProduct";



function Home() {


  return (
    <div>
      <HeroSection />
      <LatestProducts />
      <FarmerBestProduct />
      <BlogSection />
    </div>
  );
}

export default Home;