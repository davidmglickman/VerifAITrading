export default function BasicPage() {
  return (
    <html>
      <body style={{
        backgroundColor: '#F8F9FA', 
        color: '#1D1D1F', 
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 50%, #F1F3F4 100%)'
      }}>
        <h1 style={{color: '#1D1D1F', fontWeight: 'bold', marginBottom: '1rem'}}>Basic Test Page</h1>
        <p style={{color: '#86868B', marginBottom: '0.5rem'}}>Server is running on port 3000</p>
        <p style={{color: '#86868B'}}>If you can see this, Next.js is working with Apple-style design</p>
      </body>
    </html>
  )
}
