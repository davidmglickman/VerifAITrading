export const metadata = {
  title: 'VerifAI Trading - AI-Powered Stock Analysis',
  description: 'Advanced AI-powered stock swing trading platform with real-time analysis and smart alerts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
