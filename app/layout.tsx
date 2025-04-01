export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0, padding: 20, fontFamily: 'Arial, sans-serif', background: '#f9f9f9' }}>
        {children}
      </body>
    </html>
  );
}