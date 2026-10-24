import { useState } from 'react';

export function App() {
  const [count, setCount] = useState(0);

  return (
    <main className="app">
      <div className="card">
        <h1>__APP_NAME__</h1>
        <p>ここから作り始めましょう。</p>
        <button type="button" className="button" onClick={() => setCount((c) => c + 1)}>
          押した回数: {count}
        </button>
      </div>
    </main>
  );
}
