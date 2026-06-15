import { Navigate } from 'react-router-dom';

/**
 * MyLifeBook is a single-user private MVP.
 * Registration is not publicly available — redirect to login.
 */
export default function RegisterPage() {
  return <Navigate to="/login" replace />;
}
