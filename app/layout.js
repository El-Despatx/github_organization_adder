import "./globals.css";

export const metadata = {
  title: "GitHub Organization Access",
  description: "Request access to the configured GitHub organization.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
