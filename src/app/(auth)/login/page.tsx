'use client';

import { LoginForm } from '@/components/shared/LoginForm';
import { withGuest } from '@/hoc/withGuest';

function LoginPage() {
  return <LoginForm />;
}

export default withGuest(LoginPage);
