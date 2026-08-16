import React from 'react';
import { Link } from 'react-router-dom';
export default function AppHeader() {
  return <header className="bg-surface border-b border-line px-6 py-4 flex items-center justify-between"><Link to="/" className="text-xl font-bold text-teal">Rounds</Link></header>;
}
