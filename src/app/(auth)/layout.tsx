import type { Metadata } from 'next';
import Image from 'next/image';
import { Toaster } from 'sonner';
import styles from './layout.module.css';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to SocialJet CRM to manage your campaigns, sales, and finances.',
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.root}>
      <div className={styles.container}>
        {/* Brand Header */}
        <div className={styles.brand}>
          <Image
            src="/logoPurple.svg"
            alt="SocialJet"
            width={151}
            height={28}
            className={styles.logo}
            priority
          />
          <p className={styles.tagline}>Go Viral With Influencers</p>
        </div>

        {/* Card */}
        <div className={styles.card}>{children}</div>

        {/* Footer Links */}
        <div className={styles.footerLinks}>
          <a href="/privacy" className={styles.footerLink}>
            Privacy Policy
          </a>
          <span className={styles.footerDot}>•</span>
          <a href="/terms" className={styles.footerLink}>
            Terms of Service
          </a>
        </div>
      </div>

      {/* Copyright */}
      <footer className={styles.copyright}>© 2026 SocialJet. All rights reserved.</footer>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
