import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="landing-container">
            {/* Header */}
            <header className={`landing-header ${scrolled ? 'scrolled' : ''}`}>
                <Link to="/" className="logo">AgroManager</Link>
                <nav className="nav-buttons">
                    <Link to="/login" className="btn-nav-login">Login</Link>
                    <Link to="/register" className="btn-nav-register">Înregistrează-ți Ferma</Link>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1>Agricultura Viitorului, Astăzi.</h1>
                    <p>
                        Platforma digitală care îți aduce ferma în palmă. De la hărți satelitare 
                        și management de stocuri, la planificarea precisă a lucrărilor.
                    </p>
                    <Link to="/register" className="btn-cta">Începe Digitalizarea Fermei</Link>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A2 2 0 013 15.488V5.13a2 2 0 011.106-1.789l5.447-2.724a2 2 0 011.788 0l5.447 2.724A2 2 0 0118 5.13v10.358a2 2 0 01-1.106 1.789L11.447 19.276a2 2 0 01-1.788 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6l-6-3m15 0l-6 3v6m6-13l-6 3m0 0l-6-3m6 3v6"></path>
                            </svg>
                        </div>
                        <h3>Hărți Inteligente & NDVI</h3>
                        <p>Desenează-ți parcelele cu precizie, analizează sănătatea culturilor cu indici satelitari și ia decizii bazate pe date, nu pe intuiție.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                            </svg>
                        </div>
                        <h3>Gestiune Completă a Resurselor</h3>
                        <p>Monitorizează în timp real stocurile de semințe, pesticide și combustibil. Planifică achizițiile și calculează automat costurile pe hectar.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                            </svg>
                        </div>
                        <h3>Echipă și Sarcini Conectate</h3>
                        <p>Atribuie lucrări direct agronomilor și muncitorilor. Toată lumea știe ce are de făcut, unde și cu ce utilaje, direct de pe telefon.</p>
                    </div>
                </div>
            </section>

            {/* Testimonial Section */}
            <section className="testimonial-section">
                <div className="testimonial-card">
                    <blockquote no-diacritics="true">
                        AgroManager mi-a redus costurile cu 15% in primul an prin optimizarea consumului de ingrasaminte. Este indispensabil.
                    </blockquote>
                    <p className="testimonial-author">- Un fermier multumit</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-links">
                    <a href="#">Termeni si Conditii</a>
                    <a href="#">Politica de Confidentialitate</a>
                    <a href="#">Contact</a>
                </div>
                <div className="copyright">
                    &copy; {new Date().getFullYear()} AgroManager. Toate drepturile rezervate.
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
