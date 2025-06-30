import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200">
                <h1 className="text-3xl font-bold text-green-700 mb-6">Privacy Policy</h1>
                <p className="text-gray-600 mb-4">
                    Effective Date: April 28, 2025
                </p>
                <p className="text-gray-700 mb-6">
                    At <span className="font-semibold text-green-700">FreshFromTheField</span>, protecting your privacy is important to us. This policy explains what information we collect, how we use and share it, and how we keep it safe when you use our service (our website, app, etc. - which we'll call the "Platform"). By using the Platform, you agree to how we handle your information as described here.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. What Information We Collect</h2>
                <p className="text-gray-700 mb-4">
                    We collect information to help us provide and improve our service for you. This includes:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-6">
                    <li>
                        <strong>Your Personal Details</strong>: When you sign up, order, or use the Platform, we collect things like:
                        <ul className="list-circle pl-6 mt-2">
                            <li>Your first and last name</li>
                            <li>Email address</li>
                            <li>Phone number</li>
                            <li>Delivery address (street, city, province)</li>
                            <li>Any special delivery instructions you give us</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Order Details</strong>: Information about the orders you place or receive:
                        <ul className="list-circle pl-6 mt-2">
                            <li>What products you bought (name, quantity)</li>
                            <li>How much the order cost</li>
                            <li>The status of the order (like Pending, Accepted, Delivered, Cancelled)</li>
                            <li>Why an order was cancelled (if it was)</li>
                            <li>When the order was placed</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Account Details</strong>: To manage your account and keep it secure:
                        <ul className="list-circle pl-6 mt-2">
                            <li>Your role (Buyer or Farmer)</li>
                            <li>Your password (which we store securely so even we can't see it)</li>
                            <li>Information that helps us confirm it's really you logging in</li>
                        </ul>
                    </li>
                    <li>
                        <strong>How You Use the Platform</strong>: Information about your activity:
                        <ul className="list-circle pl-6 mt-2">
                            <li>General location and internet connection information</li>
                            <li>What type of web browser you use</li>
                            <li>Which pages you visit and how long you stay</li>
                            <li>How you navigate through the Platform</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Device Details</strong>: Information about the device you're using:
                        <ul className="list-circle pl-6 mt-2">
                            <li>What kind of device it is (phone, computer)</li>
                            <li>Its operating system (like iOS, Android, Windows)</li>
                            <li>Unique identifiers for your device</li>
                        </ul>
                    </li>
                </ul>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. How We Use Your Information</h2>
                <p className="text-gray-700 mb-4">
                    We use the information we collect to run and improve the Platform. This includes:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-6">
                    <li>Processing your orders and connecting Buyers with Farmers.</li>
                    <li>Managing your account and letting you log in securely.</li>
                    <li>Contacting you about your orders, account, or if you need help.</li>
                    <li>Showing Buyers their order history and Farmers their order details.</li>
                    <li>Updating order statuses (like changing from Pending to Accepted).</li>
                    <li>Making our service better by looking at how people use it.</li>
                    <li>Keeping the Platform safe by preventing fraud or unauthorized use.</li>
                    <li>Following legal requirements and settling disagreements.</li>
                </ul>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. How We Share Your Information</h2>
                <p className="text-gray-700 mb-4">
                    We might share your information in these situations:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-6">
                    <li>
                        <strong>With Other Users (To Complete Orders)</strong>:
                        <ul className="list-circle pl-6 mt-2">
                            <li>We share the Buyer’s name, delivery address, phone number, and delivery instructions with the Farmer handling the order so they can deliver it.</li>
                            <li>We share the Farmer’s name with the Buyer so they know who is fulfilling their order.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>With Service Providers</strong>: We use other companies to help us run the Platform. They might help with:
                        <ul className="list-circle pl-6 mt-2">
                            <li>Processing payments</li>
                            <li>Hosting our website and storing data</li>
                            <li>Analyzing how the Platform is used</li>
                            <li>Sending emails and notifications</li>
                        </ul>
                        These providers only get the information they need to do their job for us.
                    </li>
                    <li>
                        <strong>For Legal Reasons</strong>: If required by law or a court order, we may need to share your information.</li>
                    <li>
                        <strong>If Our Business Changes Hands</strong>: If we sell or merge our business, your information might be transferred to the new owners.</li>
                </ul>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Keeping Your Data Safe</h2>
                <p className="text-gray-700 mb-6">
                    We use standard security practices to protect your information, such as:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-6">
                    <li>Using technical measures like encryption to protect sensitive information.</li>
                    <li>Storing passwords securely.</li>
                    <li>Helping you log in securely.</li>
                    <li>Regularly checking our systems for security weaknesses.</li>
                    <li>Limiting access to your information to only necessary staff.</li>
                </ul>
                <p className="text-gray-700 mb-6">
                    However, no online system can be 100% secure. Please use a strong password and keep your account details safe. Using our Platform means you understand this risk.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Your Rights and Choices</h2>
                <p className="text-gray-700 mb-4">
                    You have rights regarding your personal information:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-6">
                    <li><strong>See Your Data</strong>: Ask to see the personal information we have about you.</li>
                    <li><strong>Correct Your Data</strong>: Ask us to fix any information that's wrong or incomplete.</li>
                    <li><strong>Delete Your Data</strong>: Ask us to delete your information (though we may need to keep some if required by law).</li>
                    <li><strong>Limit Use</strong>: Ask us to limit how we use your information in certain cases.</li>
                    <li><strong>Get Your Data</strong>: Ask for your information in a format you can easily use.</li>
                    <li><strong>Object</strong>: Tell us you don't want us to use your information in certain ways (like for marketing).</li>
                </ul>
                <p className="text-gray-700 mb-6">
                    To use these rights, please contact us at <a href="mailto:support@freshfromthefield.com" className="text-green-700 hover:underline">support@freshfromthefield.com</a>. We aim to respond within 30 days.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Cookies</h2>
                <p className="text-gray-700 mb-6">
                    We use "cookies" (small files stored on your device) and similar technologies. These help the Platform work, remember your preferences, see how the site is used, and sometimes show relevant content. You can usually control cookies through your web browser's settings.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Links to Other Websites</h2>
                <p className="text-gray-700 mb-6">
                    Our Platform might contain links to other websites (like payment services). We aren't responsible for how they handle your privacy. Please read their privacy policies if you visit them.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Children’s Privacy</h2>
                <p className="text-gray-700 mb-6">
                    Our Platform is not for children under 18. We don't intentionally collect information from children. If you think a child has given us information, please contact us so we can remove it.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Where Your Information is Stored</h2>
                <p className="text-gray-700 mb-6">
                    Your information might be stored and processed in countries outside of where you live, like Pakistan or the United States. We take steps to make sure your information is protected when it's transferred across borders.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Changes to This Policy</h2>
                <p className="text-gray-700 mb-6">
                    We might update this Privacy Policy sometimes. If we make major changes, we'll let you know by email or by posting a notice on the Platform. The date at the top shows when it was last updated.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Contact Us</h2>
                <p className="text-gray-700 mb-6">
                    If you have questions about this Privacy Policy, please contact us:
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

export default PrivacyPolicy;