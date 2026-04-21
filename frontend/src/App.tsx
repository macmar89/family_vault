import './App.css';
import { Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { CreateFirstUser } from './pages/CreateFirstUser';
import { ROUTES } from './lib/routes';

function App() {
  return (
    <>
      <Routes>
        <Route path={ROUTES.AUTH.LOGIN} element={<LoginPage />} />
        <Route
          path={ROUTES.AUTH.CREATE_FIRST_USER}
          element={<CreateFirstUser />}
        />
      </Routes>
    </>
  );
}

export default App;
