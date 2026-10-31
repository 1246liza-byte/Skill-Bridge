export default function Spinner({ text }) {
    return (
        <div className="loading-center">
            <div className="spinner"></div>
            {text && <p className="mt-2 text-muted">{text}</p>}
        </div>
    );
}