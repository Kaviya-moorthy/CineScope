import { KeyRound } from 'lucide-react';

export default function SetupRequired() {
  return (
    <div className="container page">
      <div className="state">
        <KeyRound size={36} aria-hidden="true" />
        <h1>Connect CineScope to TMDB</h1>
        <p>CineScope shows real movie data from TMDB, so it needs an API credential to start.</p>
        <ol className="setup-steps">
          <li>Create a free account at themoviedb.org and request an API key in Settings, API.</li>
          <li>Copy <code>.env.example</code> to <code>.env</code>.</li>
          <li>Paste the key into <code>VITE_TMDB_API_KEY</code> (or the read access token into <code>VITE_TMDB_READ_TOKEN</code>).</li>
          <li>Stop and restart <code>npm run dev</code>.</li>
        </ol>
      </div>
    </div>
  );
}
