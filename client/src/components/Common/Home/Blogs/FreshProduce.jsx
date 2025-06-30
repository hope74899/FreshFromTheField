

const FreshProduce = () => {
    return (
        <section className="bg-white py-16 px-6 sm:px-12 text-gray-800">
            <div className="max-w-4xl mx-auto">

                {/* Title */}
                <h1 className="text-4xl font-bold text-green-700 mb-6 text-center">
                    How to Choose the Right Produce Variety
                </h1>

                {/* Intro Paragraph */}
                <p className="text-lg mb-6">
                    When it comes to buying fresh fruits and vegetables, not all produce is created equal.
                    Within every crop type—whether it’s tomatoes, potatoes, apples, or spinach—there are multiple varieties,
                    each with unique traits in taste, texture, shelf life, and growing conditions.
                </p>
                <p className="text-lg mb-6">
                    Choosing the right variety can mean the difference between a meal that’s simply decent
                    and one that bursts with flavor, color, and nutrition.
                </p>

                {/* Image 1 */}
                <img
                    src="/blog3image1.jpg"
                    alt="Variety of fresh produce"
                    className="w-full h-80 object-cover rounded-xl shadow mb-8"
                />

                {/* Section 1: Purpose */}
                <h2 className="text-2xl font-semibold text-green-700 mb-4">
                    1. Understand Your Purpose
                </h2>
                <p className="mb-4">
                    Are you making a salad? Roasting vegetables? Baking a pie? Different varieties are bred for different culinary needs.
                </p>
                <ul className="list-disc list-inside mb-6 space-y-2">
                    <li><strong>Tomatoes:</strong> Roma for sauces, Cherry for salads.</li>
                    <li><strong>Potatoes:</strong> Yukon Gold for boiling, Russets for frying.</li>
                    <li><strong>Apples:</strong> Granny Smith for baking, Fuji for eating raw.</li>
                </ul>
                <p className="italic mb-8">Tip: Always ask the farmer about the best uses for their produce—it helps avoid mismatched expectations.</p>

                {/* Section 2: Flavor */}
                <h2 className="text-2xl font-semibold text-green-700 mb-4">
                    2. Flavor Profiles Matter
                </h2>
                <p className="mb-4">
                    Farmers often grow heirloom varieties that may not look “perfect” but are incredibly flavorful.
                    Supermarket chains prioritize appearance and shelf life, while local farmers focus more on taste, nutrition, and biodiversity.
                </p>
                <ul className="list-disc list-inside mb-6 space-y-2">
                    <li><strong>Brandywine Tomatoes:</strong> Deep, rich flavor.</li>
                    <li><strong>Dragon Tongue Beans:</strong> Nutty and tender.</li>
                    <li><strong>Chioggia Beets:</strong> Striped and sweet.</li>
                </ul>

                {/* Section 3: Seasonality */}
                <h2 className="text-2xl font-semibold text-green-700 mb-4">
                    3. Seasonality Is Key
                </h2>
                <p className="mb-6">
                    Buying produce that’s in season ensures freshness and better prices.
                    Seasonal varieties are more abundant, higher in nutrients, and cost-effective.
                </p>
                <p className="mb-6">
                    For example, strawberries like Earliglow are early-season and super sweet, while mid-season types are better for freezing.
                </p>

                {/* Image 2 */}
                <img
                    src="/blog3image2.jpg"
                    alt="Field changing across seasons"
                    className="w-full h-80 object-cover rounded-xl shadow mb-8"
                />

                {/* Section 4: Growing Practices */}
                <h2 className="text-2xl font-semibold text-green-700 mb-4">
                    4. Consider Growing Practices
                </h2>
                <ul className="list-disc list-inside mb-6 space-y-2">
                    <li><strong>Heirloom:</strong> Unique and flavorful, but may spoil quickly.</li>
                    <li><strong>Hybrid:</strong> Bred for disease resistance and longer shelf life.</li>
                    <li><strong>Organic:</strong> Grown without synthetic chemicals.</li>
                </ul>

                {/* Section 5: Storage */}
                <h2 className="text-2xl font-semibold text-green-700 mb-4">
                    5. Think About Storage & Shelf Life
                </h2>
                <p className="mb-6">
                    Not all varieties have the same storage capabilities. Plan your purchases around how long each item stays fresh.
                </p>
                <ul className="list-disc list-inside mb-6 space-y-2">
                    <li>Hard squash like Butternut stores for months.</li>
                    <li>Leafy greens must be eaten quickly.</li>
                    <li>Some garlic and onions last longer depending on type.</li>
                </ul>

                {/* Conclusion */}
                <div className="mt-10">
                    <h3 className="text-2xl font-bold text-green-700 mb-4">Conclusion</h3>
                    <p className="mb-6">
                        Choosing the right produce variety isn’t just for chefs or foodies—it’s for anyone who wants to eat better.
                        With a little knowledge, you can elevate your cooking, support biodiversity,
                        and build relationships with the farmers who grow your food.
                    </p>
                    <p className="mb-4 font-semibold italic">
                        Next time you shop, think beyond just “apples”—think “which apple variety suits my recipe, my taste, and my values?”
                    </p>
                </div>
            </div>
        </section>
    );
};

export default FreshProduce;
