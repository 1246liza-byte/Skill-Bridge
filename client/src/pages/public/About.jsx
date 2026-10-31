import { useSite } from '../../context/SiteContext';

export default function About() {
    const { settings } = useSite();
    const aboutText = settings?.aboutUs || 'Skills Bridge is a marketplace that connects talented students with clients who need real-world work done.';

    return (
        <div>
            <section className="hero">
                <div className="container">
                    <h1 className="animate-fade-in-up">About Us</h1>
                    <p className="animate-fade-in-up delay-1">Learn more about Skills Bridge</p>
                </div>
            </section>

            <div className="page-section">
                <div className="container">
                    <div className="card card-accent animate-fade-in-up">
                        <p style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>{aboutText}</p>
                    </div>

                    <div className="grid grid-3 mt-4">
                        <div className="card card-hover text-center animate-fade-in-up">
                            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎓</div>
                            <h3 className="text-navy mb-1">For Students</h3>
                            <p className="text-muted">Build your portfolio, earn income, and gain real professional experience while studying.</p>
                        </div>
                        <div className="card card-hover text-center animate-fade-in-up delay-1">
                            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>💼</div>
                            <h3 className="text-navy mb-1">For Clients</h3>
                            <p className="text-muted">Hire talented, motivated students for high-quality work at student-friendly rates.</p>
                        </div>
                        <div className="card card-hover text-center animate-fade-in-up delay-2">
                            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🤝</div>
                            <h3 className="text-navy mb-1">Our Mission</h3>
                            <p className="text-muted">Bridge the gap between education and industry by creating real opportunities for students.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}