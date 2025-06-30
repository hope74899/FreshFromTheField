
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa'; // React Icons

const Footer = () => {
    return (
        <footer className="bg-black opacity-75 text-gray-100 py-12 w-full">
            <div className="w-full px-4 lg:px-8">
                <div className="flex flex-col gap-8 md:grid md:grid-cols-1 lg:grid-cols-3 lg:gap-14 ">
                    {/* About FreshFromTheField */}
                    <div className="text-center lg:text-left">
                        <h2 className="text-2xl font-semibold mb-5 text-white">
                            FreshFromTheField
                        </h2>
                        <p className="text-gray-100">
                            Connecting you directly with local farmers for the freshest
                            produce. We believe in sustainable agriculture and supporting our
                            community.
                        </p>
                    </div>

                    {/* Company Links */}
                    <div className="text-center lg:text-left">
                        <p className="text-xl font-medium mb-5 text-white">Company</p>
                        <ul className="flex flex-col gap-2 text-gray-100">
                            <li>
                                <Link to="/" className="hover:text-yellow-600">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="hover:text-yellow-600">
                                    About Us
                                </Link>
                            </li>
                            <Link to="/privacy-policy" className="hover:text-yellow-600">Privacy Policy</Link>
                            <Link to="/terms-of-service" className="hover:text-yellow-600">Terms of Service</Link>
                        </ul>
                    </div>

                    {/* Contact Information */}
                    <div className="text-center lg:text-left">
                        <p className="text-xl font-medium mb-5 text-white">Get In Touch</p>
                        <ul className="flex flex-col gap-2 text-gray-100">
                            <li>+92 345 2768234</li>
                            <li>support@freshfromthefield.com</li>
                            <li>123 Green Fields, Multan, Punjab, Pakistan</li>
                        </ul>
                    </div>
                </div>

                {/* Copyright Notice and Social Icons (Optional) */}
                <div className="mt-10 border-t border-stone-400 pt-5">
                    <div className="flex flex-col items-center lg:flex-row lg:justify-between gap-4">
                        <p className="text-sm text-center lg:text-left text-gray-100">
                            Copyright 2024 © FreshFromTheField. All rights reserved.
                        </p>

                        {/* Social Media Icons (React Icons) */}
                        <div className="flex space-x-4">
                            <a href="#" className="hover:text-yellow-600">
                                <FaFacebook size={24} />{/* Facebook Icon */}
                            </a>
                            <a href="#" className="hover:text-yellow-600">
                                <FaTwitter size={24} />{/* Twitter Icon */}
                            </a>
                            <a href="#" className="hover:text-yellow-600">
                                <FaInstagram size={24} />{/* Instagram Icon */}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;