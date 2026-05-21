import { useAuth } from '../context/AuthContext';
import { useRefillModal } from '../context/RefillModalContext';
import { useUpgradeModal } from '../context/UpgradeModalContext';
import { hasActiveSubscription } from '../utils/subscription';
import { isInsufficientCreditsError } from '../utils/insufficientCredits';

/**
 * Opens upgrade modal when no active subscription, otherwise refill modal.
 */
export function useInsufficientCreditsHandler() {
  const { user } = useAuth();
  const { openRefillModal } = useRefillModal();
  const { openUpgradeModal } = useUpgradeModal();

  const handleInsufficientCredits = (refillOptions = {}) => {
    if (hasActiveSubscription(user)) {
      openRefillModal(refillOptions);
    } else {
      openUpgradeModal();
    }
  };

  const handleInsufficientCreditsError = (error, refillOptions = {}) => {
    if (!isInsufficientCreditsError(error)) return false;
    handleInsufficientCredits(refillOptions);
    return true;
  };

  return {
    handleInsufficientCredits,
    handleInsufficientCreditsError,
    isInsufficientCreditsError,
    hasActiveSubscription: () => hasActiveSubscription(user),
  };
}
