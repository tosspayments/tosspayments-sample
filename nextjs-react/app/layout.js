import "./globals.css";

export const metadata = {
  title: "토스페이먼츠 Next.js + React 샘플",
  description: "토스페이먼츠 JavaScript SDK Next.js 샘플 프로젝트",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
