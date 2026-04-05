import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '1rem',
      }}
    >
      <h1 style={{ fontSize: '4rem', fontWeight: 700 }}>404</h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)' }}>Page not found</p>
      <Link
        href="/"
        style={{
          color: 'var(--color-primary-600)',
          textDecoration: 'underline',
          marginTop: '1rem',
        }}
      >
        Go back home
      </Link>
    </div>
  );
}
