import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * MINIMAL DEBUG VERSION - Tests if buttons work at all
 * If this works, the issue is in the complex logic
 * If this doesn't work, the issue is CSS or DOM structure
 */
export function FocusTimerWidgetDebug() {
  const [collapsed, setCollapsed] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 rounded-2xl border border-green-500 bg-green-500/10 p-4 shadow-2xl">
      <div className="mb-2 flex justify-between items-center">
        <div>
          <p className="text-sm text-green-400 font-bold">DEBUG MODE</p>
          <p className="text-2xl font-black text-white">25:00</p>
        </div>
        <button
          onClick={() => {
            console.log('COLLAPSE CLICKED');
            setCollapsed(prev => !prev);
          }}
          className="p-1 rounded-full border border-green-400/20 bg-green-500/20 hover:bg-green-500/30"
        >
          {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <div className="h-2 w-full rounded-full bg-gray-600 overflow-hidden mb-3">
        <div className="h-full bg-green-500 w-1/2" />
      </div>

      {!collapsed && (
        <>
          <button
            onClick={() => {
              console.log('START CLICKED');
              setClickCount(prev => prev + 1);
            }}
            className="w-full px-3 py-2 mb-2 rounded-lg border border-green-400/20 bg-green-500/20 hover:bg-green-500/30 text-white text-sm font-semibold"
          >
            Start (Clicks: {clickCount})
          </button>
          <button
            onClick={() => console.log('STOP CLICKED')}
            className="w-full px-3 py-2 rounded-lg border border-green-400/20 bg-green-500/20 hover:bg-green-500/30 text-white text-sm font-semibold"
          >
            Stop
          </button>
        </>
      )}
    </div>
  );
}
