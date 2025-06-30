
const BlogSection = () => {
  const blogPosts = [
    {
      title: 'Why Direct Farm-to-Buyer Matters',
      excerpt: 'Explore how cutting out the middleman helps both farmers and buyers with better pricing and fresher produce.',
      imageUrl: '/Farm-to-Buyer.png',
      link: '/farm-to-buyer'
    },
    {
      title: 'Transporters: The Unsung Heroes of Fresh Delivery',
      excerpt: 'Understand the role of local transporters in making sure fresh produce reaches you in time.',
      imageUrl: '/transporter.png',
      link: '/transporter'
    },
    {
      title: 'How to Choose the Right Produce Variety',
      excerpt: 'Learn how our platform helps you filter and pick the best-suited variety for your needs and scale.',
      imageUrl: '/freshProduce.jpg',
      link: '/freshProduce'
    }
  ];

  return (
    <section className="bg-white py-4">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <h2 className="text-3xl font-bold text-green-700 text-center mb-10">
          Insights from the Field
        </h2>

        {/* Grid of Blog Posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full object-cover"
              />
              <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  {post.excerpt}
                </p>
                <a
                  href={post.link}
                  className="inline-block text-green-700 hover:text-green-800 font-medium transition-colors"
                >
                  Read More →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
