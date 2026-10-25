import PolicyPage from '../components/PolicyPage'
import { policies } from '../content/siteContent'
export const Shipping = () => <PolicyPage doc={policies.shipping} />
export const Returns = () => <PolicyPage doc={policies.returns} />
export const Privacy = () => <PolicyPage doc={policies.privacy} />
export const Terms = () => <PolicyPage doc={policies.terms} />
