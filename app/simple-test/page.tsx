export default function SimpleTest() {
  return (
    <div style={{ padding: '2rem', backgroundColor: '#000', color: 'white', minHeight: '100vh' }}>
      <h1>Test Page Working!</h1>
      <p>If you can see this, the server is running correctly.</p>
      <button onClick={() => alert('Button works!')}>Click Test</button>
    </div>
  )
}
