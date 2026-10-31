import { Link } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';

export default function Footer() {
    const { settings } = useSite();
    const footerText = settings?.footerText || '© 2026 Skills Bridge. All rights reserved.';
    const social = settings?.socialLinks || {};

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-col">
                        <h4>{settings?.siteName || 'Skills Bridge'}</h4>
                        <p>{settings?.tagline || 'Connecting students with real-world opportunities'}</p>
                    </div>
                    <div className="footer-col">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link to="/students">Find Students</Link></li>
                            <li><Link to="/projects">Find Projects</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Legal</h4>
                        <ul>
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                            <li><Link to="/terms">Terms of Service</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Contact</h4>
                        <p>{settings?.contactEmail}</p>
                        <p>{settings?.contactPhone}</p>
                        <div className="footer-social">
                            {social.facebook && <a href={social.facebook} target="_blank" rel="noreferrer">FB</a>}
                            {social.twitter && <a href={social.twitter} target="_blank" rel="noreferrer">TW</a>}
                            {social.linkedin && <a href={social.linkedin} target="_blank" rel="noreferrer">IN</a>}
                            {social.instagram && <a href={social.instagram} target="_blank" rel="noreferrer">IG</a>}
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>{footerText}</p>
                </div>
            </div>
        </footer>
    );
}