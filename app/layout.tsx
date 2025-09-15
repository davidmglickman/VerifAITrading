import ChatBot from '../components/ChatBot'
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
      <head>
        <style>{`
          .btn-primary:hover:not(:disabled) {
            background-color: #0056CC !important;
          }
          .btn-secondary:hover:not(:disabled) {
            background-color: #007AFF !important;
            color: white !important;
          }
        `}</style>
      </head>
      <body>
        {children}
        {/* Global Chat Bot */}
        <ChatBot />
      </body>
    </html>
  )
}
