import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ClientsPage from './pages/ClientsPage';
import AccountsPage from './pages/AccountsPage';
import CreditsPage from './pages/CreditsPage';
import './styles/shared.css';

function App() {
  return (
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/credits" element={<CreditsPage />} />
        </Routes>
      </Layout>
  );
}

export default App;