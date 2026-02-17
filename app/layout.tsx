import "../styles/globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Mock Interview",
  openGraph: {
    title: "AI Mock Interview",
    description:
      "An AI-powered mock interview platform that helps you practice for your next job interview.",
    images: [
      {
        url: "/opengraph-image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Mock Interview",
    description:
      "An AI-powered mock interview platform that helps you practice for your next job interview.",
    images: ["/opengraph-image"],
  },
  themeColor: "#FFF",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="scroll-smooth antialiased [font-feature-settings:'ss01']">
        {children}
      </body>
    </html>
  );
}
