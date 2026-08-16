import React, { useState } from 'react';

export default function SummaryEditor({ text, status, onSave, onFinalize }) {
  const [val, setVal] = useState(text);
  return (
    <div>
      {/* Screen View (Interactive) */}
      <div className="print:hidden">
        <textarea 
          className="w-full h-[500px] border border-line p-4 rounded mb-4 focus:border-teal outline-none text-sm leading-relaxed" 
          value={val} 
          onChange={e => setVal(e.target.value)} 
          disabled={status === 'final'} 
        />
        <div className="flex gap-3">
          <button onClick={() => onSave(val)} disabled={status === 'final'} className="px-4 py-2 bg-paper border border-line rounded hover:bg-gray-50 transition-colors">Save Draft</button>
          <button onClick={onFinalize} disabled={status === 'final'} className="px-4 py-2 bg-teal hover:bg-teal-dark text-white rounded transition-colors">Finalize & Print</button>
        </div>
      </div>

      {/* Print View (Only visible on paper) */}
      <div className="hidden print:block font-sans text-black whitespace-pre-wrap">
        {val}
      </div>
    </div>
  );
}
