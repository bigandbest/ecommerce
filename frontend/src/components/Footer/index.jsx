import React from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaPinterestP, FaYoutube } from 'react-icons/fa';
import { MdOutlineEmail, MdOutlineLocationOn, MdOutlinePhone } from 'react-icons/md';
import './style.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  if (location.pathname == "/all") {
    return null;
  }
  if (location.pathname.startsWith("/subcategories")) return null;

  return (
    <footer className="bg-gray-800 text-gray-300 absolute w-full">
      <div className="container px-4 py-6 mx-auto">
        {/* Footer top section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* About section */}
          <div className="footer-column">
            <div className="mb-2">
              <h3 className="text-sm font-semibold text-white mb-2">BIG & BEST MART (OPC) PRIVATE LIMITED</h3>
            </div>
            <p className="text-xs mb-3 text-gray-400 leading-relaxed">
             <b>Big and best mart</b> offers high-quality stationery and office supplies for professionals,
              students, and businesses.
            </p>
            <div className="social-icons flex space-x-2">
              <a href="https://www.facebook.com/share/16iZ1wvpYd/" className="social-icon-compact" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="#" className="social-icon-compact" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" className="social-icon-compact" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="#" className="social-icon-compact" aria-label="Youtube">
                <FaYoutube />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="footer-column">
            <h3 className="footer-title-compact">Quick Links</h3>
            <ul className="footer-links-compact">
              <li>
                <Link to="/about-us" className="footer-link-compact">About Us</Link>
              </li>
              <li>
                <Link to="/contact-us" className="footer-link-compact">Contact Us</Link>
              </li>
              <li>
                <Link to="/bbm-dost" className="footer-link-compact">BBM DOST</Link>
              </li>
              <li>
                <Link to="/faq" className="footer-link-compact">FAQ</Link>
              </li>
              <li>
                <Link to="/shipping-returns" className="footer-link-compact">Shipping & Returns</Link>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div className="footer-column">
            <h3 className="footer-title-compact">Contact Us</h3>
            <ul className="footer-contact-compact">
              <li className="flex items-start mb-2">
                <MdOutlineLocationOn className="text-sm text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-400 leading-relaxed">
                  Uttapara, Madhyamgram, North 24 Parganas, West Bengal, 700129
                </p>
              </li>
              <li className="flex items-center mb-1">
                <MdOutlinePhone className="text-sm text-gray-400 mr-2" />
                <a href="tel:+917059911480" className="text-xs text-gray-400 hover:text-white transition-colors">
                  +91 7059911480
                </a>
              </li>
              <li className="flex items-center mb-2">
                <MdOutlineEmail className="text-sm text-gray-400 mr-2" />
                <a href="mailto:bigandbestmart@gmail.com" className="text-xs text-gray-400 hover:text-white transition-colors">
                  bigandbestmart@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Map column */}
          <div className="footer-column">
            <h3 className="footer-title-compact">Location</h3>
            <div className="rounded overflow-hidden shadow-sm border border-gray-700 bg-gray-900">
              <a
                href="https://maps.google.com/?q=22.7035140,88.4672730"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View on Google Maps"
                className="block hover:opacity-90"
              >
                <iframe
                  title="BBMart Location Map"
                  width="100%"
                  height="100"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src="https://www.google.com/maps?q=22.7035140,88.4672730&z=16&output=embed"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
                <div className="text-xs text-blue-400 text-center py-1 underline">View on Maps</div>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs text-gray-400 mb-1 md:mb-0">
              &copy; {currentYear} BBMart. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/privacy-policy" className="text-xs text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-xs text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
