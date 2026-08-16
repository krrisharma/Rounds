import React, { useState } from 'react';
export default function SummaryEditor({ text, status, onSave, onFinalize }) {
  const [val, setVal] = useState(text);
  return <div><textarea className="w-full h-64 border border-line p-3 rounded mb-4 focus:border-teal outline-none" value={val} onChange={e => setVal(e.target.value)} disabled={status === 'final'} /><div className="flex gap-3"><button onClick={() => onSave(val)} disabled={status === 'final'} className="px-4 py-2 bg-paper border border-line rounded">Save Draft</button><button onClick={onFinalize} disabled={status === 'final'} className="px-4 py-2 bg-chart text-white rounded">Finalize</button></div></div>;
}
