import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { SiteProvider } from './context/SiteContext';
import './index.css';
import './layout.css';

// Show any uncaught runtime error on screen instead of a blank white page.
// IMPORTANT: never touch #root here — React owns that node. We append a
// separate overlay to <body> so we don't corrupt React's DOM tree.
function showFatalError(message, stack) {
    let el = document.getElementById('fatal-error-overlay');
    if (!el) {
        el = document.createElement('div');
        el.id = 'fatal-error-overlay';
        el.style.cssText =
            'position:fixed;inset:0;z-index:99999;overflow:auto;padding:24px;' +
            'font-family:monospace;color:#b91c1c;background:#fff;';
        document.body.appendChild(el);
    }
    el.innerHTML = `
        <h2 style="margin:0 0 12px;">App crashed at runtime</h2>
        <pre style="white-space:pre-wrap;background:#fef2f2;padding:16px;border-radius:8px;border:1px solid #fecaca;">${message}</pre>
        ${stack ? `<pre style="white-space:pre-wrap;color:#6b7280;font-size:12px;">${stack}</pre>` : ''}
    `;
}

window.addEventListener('error', (e) => {
    showFatalError(e.message, e.error && e.error.stack);
});
window.addEventListener('unhandledrejection', (e) => {
    showFatalError(
        'Unhandled promise rejection: ' + (e.reason && e.reason.message ? e.reason.message : e.reason),
        e.reason && e.reason.stack
    );
});

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }
    static getDerivedStateFromError(error) {
        return { error };
    }
    componentDidCatch(error, info) {
        console.error('React render error:', error, info);
    }
    render() {
        if (this.state.error) {
            return (
                <div style={{ padding: 24, fontFamily: 'monospace', color: '#b91c1c' }}>
                    <h2>App crashed while rendering</h2>
                    <pre style={{ whiteSpace: 'pre-wrap', background: '#fef2f2', padding: 16, borderRadius: 8 }}>
                        {String((this.state.error && this.state.error.stack) || this.state.error)}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <BrowserRouter>
                <SiteProvider>
                    <AuthProvider>
                        <NotificationProvider>
                            <App />
                        </NotificationProvider>
                    </AuthProvider>
                </SiteProvider>
            </BrowserRouter>
        </ErrorBoundary>
    </React.StrictMode>
);
