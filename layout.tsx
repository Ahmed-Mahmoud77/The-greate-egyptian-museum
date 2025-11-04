// app/layout.tsx
import "./globals.css";

export const metadata = { title: "المتحف المصري الكبير" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="app-root">{children}</body>
    </html>
  );
}
