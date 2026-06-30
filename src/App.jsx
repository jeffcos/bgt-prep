import { useAppContext, AppProvider } from "./context/AppContext";
import './index.css';
import LoginScreen from './components/LoginScreen';
import StaffApp from './components/StaffApp';

function Main() {
  const { user } = useAppContext();

  if (user === undefined) {
    return <div className="flex items-center justify-center h-screen text-carbon-50 bg-surface-sidebar">Loading…</div>;
  }

  if (!user) return <LoginScreen />;

  return <StaffApp />;
}

export default function App() {
  return (
    <AppProvider>
      <Main />
    </AppProvider>
  );
}
