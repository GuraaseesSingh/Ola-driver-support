import { Info } from "lucide-react";

export default function ScenarioInfo() {
  return (
    <div className="bg-card rounded-xl shadow-lg border border-border p-6">
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Info className="text-warning" size={20} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2">Current Scenario: Driver Support</h3>
          <p className="text-muted-foreground mb-4">Handling driver complaints about not receiving ride requests</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">Expected Flow</h4>
              <ol className="text-sm text-muted-foreground space-y-1">
                <li>1. Driver reports no rides for 2 hours</li>
                <li>2. Bot asks for number verification</li>
                <li>3. Driver confirms registered number</li>
                <li>4. Bot checks account status</li>
                <li>5. Bot suggests location change</li>
              </ol>
            </div>
            
            <div className="bg-accent/50 rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">Key Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Real-time Hindi voice processing</li>
                <li>• LiveKit WebRTC integration</li>
                <li>• Groq Cloud API for LLM</li>
                <li>• Predefined conversation flow</li>
                <li>• Low latency audio streaming</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
