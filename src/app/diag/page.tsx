export default function DiagPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Diagnostic Page</h1>
      <p>Time: {new Date().toISOString()}</p>
      <p>If you see this, Next.js routing is working.</p>
    </div>
  )
}