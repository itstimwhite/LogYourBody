export default function TestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-4xl font-bold text-foreground mb-4">CSS Test Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-primary text-primary-foreground rounded">
          Primary Color (should be purple)
        </div>
        
        <div className="p-4 bg-secondary text-secondary-foreground rounded">
          Secondary Color
        </div>
        
        <div className="p-4 bg-accent text-accent-foreground rounded">
          Accent Color
        </div>
        
        <div className="p-4 bg-card text-card-foreground border rounded">
          Card with Border
        </div>
        
        <div className="p-4 bg-muted text-muted-foreground rounded">
          Muted Background
        </div>
        
        <div className="p-4 bg-destructive text-destructive-foreground rounded">
          Destructive (Error) Color
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-red-500 text-white p-4 rounded">
            Red (TW Default)
          </div>
          <div className="bg-green-500 text-white p-4 rounded">
            Green (TW Default)
          </div>
          <div className="bg-blue-500 text-white p-4 rounded">
            Blue (TW Default)
          </div>
        </div>
      </div>
    </div>
  )
}