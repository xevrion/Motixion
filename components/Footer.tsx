import React from "react";
import { Github, Twitter, MessageCircle } from "lucide-react";

const footerLinks = {
  product: [
    { name: "Features", href: "#features" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "Compare", href: "#compare" },
    { name: "FAQ", href: "#faq" },
  ],
};

const socialLinks = [
  { name: "GitHub", icon: Github, href: "https://github.com/xevrion/motixion" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
  { name: "Discord", icon: MessageCircle, href: "https://discord.com" },
];

const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
  // Only handle hash links for smooth scrolling
  if (href.startsWith('#')) {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      const offset = 80; // Account for fixed navbar height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
  // For external links, let the browser handle navigation normally
};

const Footer = () => {
  return (
    <footer className="border-t border-white/5 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-bold text-zinc-950 text-lg">
                M
              </div>
              <span className="text-xl font-semibold text-foreground">Motixion</span>
            </div>
            <p className="text-zinc-500 text-sm max-w-xs mb-6">
              The minimal accountability tracker for high-performers. 
              Open source, privacy-first, built for domination.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center text-zinc-400 hover:text-foreground hover:border-emerald-500/50 transition-all"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className="text-sm text-zinc-500 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-600">
            © {new Date().getFullYear()} Motixion. Open Source under MIT License.
          </p>
          <p className="text-sm text-zinc-600">
            Made with focus by{" "}
            <a href="https://github.com/xevrion" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400 hover:scale-105 hover:translate-y-[-1px] transition-all duration-200 inline-block">
              xevrion
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
