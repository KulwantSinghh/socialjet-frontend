'use client';

import { ForgotPasswordFlow } from '@/components/shared/ForgotPasswordFlow';
import { withGuest } from '@/hoc/withGuest';

function ForgotPasswordPage() {
  return <ForgotPasswordFlow />;
}

export default withGuest(ForgotPasswordPage);
