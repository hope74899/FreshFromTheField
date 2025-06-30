import React from 'react';

const TermsOfService = () => {
    return (
        <div className="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200">
                <h1 className="text-3xl font-bold text-green-700 mb-6">Our Rules (Terms of Service)</h1>
                <p className="text-gray-600 mb-4">
                    Last Updated: April 28, 2025
                </p>
                <p className="text-gray-700 mb-6">
                    Welcome to <span className="font-semibold text-green-700">FreshFromTheField</span>! We connect people who want to buy fresh farm products ("Buyers") with people who grow and sell them ("Farmers"). These are the rules ("Terms") for using our service, including our website and app (which we'll call the "Platform"). By using our Platform, you agree to follow these rules. If you don't agree, please don't use the Platform.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Who's Who</h2>
                <ul className="list-disc pl-6 text-gray-700 mb-6">
                    <li><strong>Buyer</strong>: Someone using the Platform to buy products.</li>
                    <li><strong>Farmer</strong>: Someone using the Platform to sell products.</li>
                    <li><strong>Order</strong>: When a Buyer agrees to buy products from a Farmer through the Platform.</li>
                    <li><strong>Platform</strong>: Our FreshFromTheField website, app, and other services.</li>
                    <li><strong>User</strong>: Anyone using the Platform (Buyers or Farmers).</li>
                </ul>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Who Can Use the Platform</h2>
                <p className="text-gray-700 mb-6">
                    You need to be at least 18 years old and legally able to make agreements to use our Platform. When you sign up, you're confirming that you meet these requirements.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Signing Up for an Account</h2>
                <p className="text-gray-700 mb-4">
                    You'll need to create an account to use most features. Please provide correct information, including:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-6">
                    <li>Your first and last name</li>
                    <li>Your email address</li>
                    <li>A password</li>
                    <li>Whether you're a Buyer or a Farmer</li>
                </ul>
                <p className="text-gray-700 mb-6">
                    Keep your password secret! You are responsible for everything that happens using your account. If you think someone else has used your account without permission, tell us right away at <a href="mailto:support@freshfromthefield.com" className="text-green-700 hover:underline">support@freshfromthefield.com</a>.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. How to Use the Platform</h2>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">4.1 Rules for Buyers</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                    <li>Place your orders carefully. Make sure your delivery address, phone number, and any special instructions are correct.</li>
                    <li>Pay for your orders when you place them using our payment system.</li>
                    <li>Check your order history for updates and talk to Farmers if needed.</li>
                </ul>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">4.2 Rules for Farmers</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                    <li>Describe your products accurately (name, price, if it's available).</li>
                    <li>Decide quickly whether to accept or cancel orders. Keep the order status updated (Pending, Accepted, Delivered).</li>
                    <li>If you cancel an order, please explain why.</li>
                    <li>Make sure your products are good quality and delivered on time.</li>
                </ul>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">4.3 How Orders Work</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-6">
                    <li>When a Buyer places an order, it starts as <span className="text-blue-700">Pending</span>.</li>
                    <li>Farmers can then <span className="text-yellow-600">Accept</span> the order or <span className="text-red-700">Cancel</span> it (they should say why if they cancel).</li>
                    <li>Once a Farmer accepts an order, they can mark it as <span className="text-green-700">Delivered</span> after delivery.</li>
                    <li>Orders that are Delivered or Cancelled are considered finished.</li>
                </ul>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Payments</h2>
                <p className="text-gray-700 mb-6">
                    Buyers pay using services like Stripe or PayPal. Farmers get paid after we take out our service fee (details are in a separate Farmer Agreement). All prices are in Pakistani Rupees (PKR) unless we say otherwise.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Cancelling Orders and Getting Refunds</h2>
                <p className="text-gray-700 mb-4">
                    Only Farmers can cancel orders, and they need a good reason (like the product is out of stock). Here's how refunds work:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-6">
                    <li>If a Farmer cancels your order, you'll get a full refund within about 7-10 business days.</li>
                    <li>The refund will go back to the payment method you used.</li>
                    <li>We generally don't give refunds for orders marked as Delivered, unless there was a serious problem with the product (like it was wrong or damaged).</li>
                </ul>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. What Not to Do</h2>
                <p className="text-gray-700 mb-4">
                    Please don't do these things on the Platform:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-6">
                    <li>Use it for anything illegal.</li>
                    <li>Give false information about products or orders.</li>
                    <li>Try to cheat the payment system or commit fraud.</li>
                    <li>Be rude, harass, or harm other users.</li>
                    <li>Try to hack or break into our systems.</li>
                </ul>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Our Content</h2>
                <p className="text-gray-700 mb-6">
                    Everything on the Platform, like our logo, design, and text, belongs to FreshFromTheField or the people who gave us permission to use it. Please don't copy, change, or share it without asking us first.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Our Responsibility (or Lack Thereof)</h2>
                <p className="text-gray-700 mb-6">
                    We provide the Platform "as is" – meaning we don't make promises about it always being perfect or available. We are not responsible for:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-6">
                    <li>Service delays, errors, or times when the Platform isn't working.</li>
                    <li>The quality of products or delivery problems (this is the Farmer's responsibility).</li>
                    <li>Any major, unexpected problems or losses that happen because you used the Platform.</li>
                </ul>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Solving Disagreements</h2>
                <p className="text-gray-700 mb-6">
                    If Buyers and Farmers have a problem, they should try to solve it between themselves first. If you have a problem with FreshFromTheField:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-6">
                    <li>Please contact us first at <a href="mailto:support@freshfromthefield.com" className="text-green-700 hover:underline">support@freshfromthefield.com</a> so we can try to help.</li>
                    <li>If we can't solve it together, any legal issues will be handled according to the laws of Pakistan, in the courts of Lahore.</li>
                </ul>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Closing Accounts</h2>
                <p className="text-gray-700 mb-6">
                    We might suspend or close your account if you break these rules (like not paying, committing fraud, or doing something prohibited). You can also choose to close your account by contacting us.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. Changes to These Rules</h2>
                <p className="text-gray-700 mb-6">
                    We might need to update these rules sometimes. If we make important changes, we'll let you know by email or post a notice on the Platform. If you keep using the Platform after the rules change, it means you accept the new rules.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">13. How to Contact Us</h2>
                <p className="text-gray-700 mb-6">
                    If you have questions about these Terms, please get in touch:
                </p>
                <p className="text-gray-700 mb-6">
                    <strong>FreshFromTheField</strong><br />
                    Email: <a href="mailto:support@freshfromthefield.com" className="text-green-700 hover:underline">support@freshfromthefield.com</a><br />
                    Address: 123 Green Fields, Multan, Punjab, Pakistan
                </p>
            </div>
        </div>
    );
};

export default TermsOfService;