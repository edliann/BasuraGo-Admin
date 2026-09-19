import './Loading.css';

function Loading() {
  return (
    <main className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">
          {/* Replace this with your BasuraGo logo */}
          <span>BasuraGo</span>
        </div>

        <p className="loading-text">Loading...</p>

        <div className="loading-spinner" />
      </div>
    </main>
  );
}

export default Loading;

