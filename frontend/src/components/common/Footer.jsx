import React from "react";
import { Link } from "react-router-dom";
import { ImGithub, ImLinkedin2 } from "react-icons/im";

const BottomFooter = ["Privacy Policy", "Cookie Policy", "Terms"];
const Resources = ["Articles", "Blog", "Docs", "Projects"];
const CompanyLinks = ["About", "Careers", "Affiliates"];

const Footer = () => {
  return (
    <div className="bg-richblack-800 mx-7 rounded-3xl mb-10">
      <div className="w-11/12 max-w-maxContent text-richblack-400 mx-auto py-10">
        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 border-b border-richblack-700 pb-8 place-items-start justify-center text-left mx-auto w-full max-w-[1000px]">
          {/* Company */}
          <div className="flex flex-col gap-3">
            <h2 className="text-richblack-50 font-semibold text-[16px]">Company</h2>
            {CompanyLinks.map((link, idx) => (
              <Link
                key={idx}
                to={link.toLowerCase()}
                className="text-sm hover:text-richblack-50 transition"
              >
                {link}
              </Link>
            ))}

            
          </div>

          {/* Resources */}
          <div className="flex flex-col gap-3">
            <h2 className="text-richblack-50 font-semibold text-[16px]">Resources</h2>
            {Resources.map((item, idx) => (
              <Link
                key={idx}
                to={item.toLowerCase().replace(/ /g, "-")}
                className="text-sm hover:text-richblack-50 transition"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Support */}
          <div className="flex flex-col gap-3">
            <h2 className="text-richblack-50 font-semibold text-[16px]">Support</h2>
            <Link to="/help-center" className="text-sm hover:text-richblack-50 transition">
              Help Center
            </Link>
          </div>
        </div>
        {/* Bottom Footer */}
      <div className="flex justify-center pt-6 text-sm text-center">
        <div>
          © 2025 DevLearn. All rights reserved.
        </div>
      </div>
    </div>
  </div>
);
};

export default Footer;
