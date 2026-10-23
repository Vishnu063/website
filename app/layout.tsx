import type { Metadata } from "next";
import "./globals.css";
const root = "https://yoru-anime-vishnu.vishnukushwaha63.chatgpt.site";
export const metadata: Metadata = {
  metadataBase: new URL(root),
  title: {
    default: "ANIMEVERSE — Your next story is you",
    template: "%s · ANIMEVERSE",
  },
  description:
    "Discover your original anime power, meet your first rival and shape Sakura City’s story. Start playing without an account.",
  alternates: { canonical: "/" },
  robots: { index: false, follow: false },
  icons: { icon: "/legacy/assets/favicon.svg" },
  openGraph: {
    title: "ANIMEVERSE — Your next story is you",
    description: "Discover your power. Meet your rival. Make your mark.",
    images: ["/legacy/assets/hero.webp"],
  },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "ANIMEVERSE",
              url: root,
              description:
                "Original anime identities and community battle discussions.",
            }),
          }}
        />
      </body>
    </html>
  );
}
