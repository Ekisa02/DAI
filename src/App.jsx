import { useStore } from './store/useStore'
import Onboarding from './pages/Onboarding.jsx'
import AppLayout from './pages/AppLayout.jsx'

export default function App() {
  const onboarded = useStore(s => s.onboarded)
  return onboarded ? <AppLayout /> : <Onboarding />
}
