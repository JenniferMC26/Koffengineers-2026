import { RouterProvider } from 'react-router-dom'
import router from './router/index.jsx'

/* ─────────────────────────────────────────────────────────
   CLYRO App — root component.
   Delegates all routing to the centralized router config.
   ───────────────────────────────────────────────────────── */
export default function App() {
  return <RouterProvider router={router} />
}
