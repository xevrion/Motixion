import { Github, Twitter, MessageCircle } from "lucide-react";

const footerLinks = {
  product: [
    { name: "Features", href: "#features" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "Pricing", href: "#compare" },
    { name: "FAQ", href: "#faq" },
  ],
  resources: [
    { name: "Documentation", href: "https://github.com/xevrion/motixion" },
    { name: "API Reference", href: "https://github.com/xevrion/motixion" },
    { name: "Changelog", href: "https://github.com/xevrion/motixion" },
    { name: "Roadmap", href: "https://github.com/xevrion/motixion" },
  ],
  legal: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "MIT License", href: "https://github.com/xevrion/motixion/blob/main/LICENSE" },
  ],
};

const socialLinks = [
  { name: "GitHub", icon: Github, href: "https://github.com/xevrion/motixion" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
  { name: "Discord", icon: MessageCircle, href: "https://discord.com" },
];

const Footer = () => {
  return (
    <footer className="border-t border-white/5 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
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

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-zinc-500 hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-500 hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target={link.href.startsWith('http') ? "_blank" : undefined}
                    rel={link.href.startsWith('http') ? "noopener noreferrer" : undefined}
                    className="text-sm text-zinc-500 hover:text-foreground transition-colors"
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
            <a href="https://github.com/xevrion" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400 transition-colors">
              xevrion
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

