const Footer = () => {
  // Internal CSS Styles
  const styles = {
    footerContainer: {
      backgroundColor: '#f8f9fa', // Light background color matching the image
      padding: '60px 80px 30px 80px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: '#4a5568',
    },
    topSection: {
      display: 'flex',
      justifyContent: 'space-between',
      // cast to any to satisfy TypeScript's stricter CSS property types
      flexWrap: 'wrap' as any,
      gap: '40px',
      marginBottom: '60px',
    },
    brandColumn: {
      flex: '1 1 250px',
      maxWidth: '300px',
    },
    logo: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#2d6a66', // Deep teal brand color
      marginBottom: '20px',
    },
    tagline: {
      fontSize: '14px',
      lineHeight: '1.6',
      marginBottom: '20px',
      color: '#4a5568',
    },
    iconRow: {
      display: 'flex',
      gap: '12px',
    },
    iconCircle: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      backgroundColor: '#edf2f7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#2d6a66',
      cursor: 'pointer',
    },
    linkColumn: {
      flex: '1 1 150px',
    },
    columnHeading: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#2d6a66',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: '25px',
    },
    linkList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    linkItem: {
      marginBottom: '12px',
    },
    link: {
      textDecoration: 'none',
      color: '#4a5568',
      fontSize: '14px',
      transition: 'color 0.2s',
    },
    contactInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      marginBottom: '12px',
      color: '#4a5568',
    },
    contactIcon: {
      color: '#2d6a66',
    },
    divider: {
      border: 'none',
      borderTop: '1px solid #e2e8f0',
      marginBottom: '30px',
    },
    bottomSection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      // cast to any to satisfy TypeScript's stricter CSS property types
      flexWrap: 'wrap' as any,
      gap: '20px',
      fontSize: '14px',
      color: '#718096',
    },
    socialLinks: {
      display: 'flex',
      gap: '24px',
    },
  };

  return (
    <footer style={styles.footerContainer}>
      {/* Upper Footer Content */}
      <div style={styles.topSection}>
        {/* Brand Info */}
        <div style={styles.brandColumn}>
          <div style={styles.logo}>CareBridge</div>
          <p style={styles.tagline}>
            Building a future where digital serenity is accessible to everyone. Your mental well-being is our priority.
          </p>
          <div style={styles.iconRow}>
            {/* Share / Network Icon */}
            <div style={styles.iconCircle}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488 1.05l-6.718-3.12a2.5 2.5 0 1 1 0-3.514l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm2.5 11a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-11-5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
              </svg>
            </div>
            {/* Message Icon */}
            <div style={styles.iconCircle}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.708 2.825L15 11.105V5.383zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741zM1 11.105l4.708-2.897L1 5.383v5.722z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Resources Column */}
        <div style={styles.linkColumn}>
          <div style={styles.columnHeading}>Resources</div>
          <ul style={styles.linkList}>
            <li style={styles.linkItem}><a href="#help" style={styles.link}>Help Center</a></li>
            <li style={styles.linkItem}><a href="#docs" style={styles.link}>Documentation</a></li>
            <li style={styles.linkItem}><a href="#crisis" style={styles.link}>Crisis Support</a></li>
            <li style={styles.linkItem}><a href="#community" style={styles.link}>Community</a></li>
          </ul>
        </div>

        {/* Company Column */}
        <div style={styles.linkColumn}>
          <div style={styles.columnHeading}>Company</div>
          <ul style={styles.linkList}>
            <li style={styles.linkItem}><a href="#about" style={styles.link}>About Us</a></li>
            <li style={styles.linkItem}><a href="#careers" style={styles.link}>Careers</a></li>
            <li style={styles.linkItem}><a href="#privacy" style={styles.link}>Privacy Policy</a></li>
            <li style={styles.linkItem}><a href="#terms" style={styles.link}>Terms of Service</a></li>
          </ul>
        </div>

        {/* Contact Column with requested updates */}
        <div style={styles.linkColumn}>
          <div style={styles.columnHeading}>Contact</div>
          
          {/* Updated Email */}
          <div style={styles.contactInfo}>
            <span style={styles.contactIcon}>
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2z"/>
              </svg>
            </span>
            <span>info@carebridge.lk</span>
          </div>

          {/* Updated Address */}
          <div style={styles.contactInfo}>
            <span style={styles.contactIcon}>
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
              </svg>
            </span>
            <span>No 45/7, Colombo 8</span>
          </div>
        </div>
      </div>

      {/* Horizontal Line Break */}
      <hr style={styles.divider} />

      {/* Lower Footer Content */}
      <div style={styles.bottomSection}>
        {/* Updated Year */}
        <div>© 2026 CareBridge. All rights reserved.</div>
        <div style={styles.socialLinks}>
          <a href="#twitter" style={styles.link}>Twitter</a>
          <a href="#linkedin" style={styles.link}>LinkedIn</a>
          <a href="#instagram" style={styles.link}>Instagram</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;