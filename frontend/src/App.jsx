import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ConfigProvider } from './context/ConfigContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import ScrollToTop from './components/public/ScrollToTop';
import Home from './pages/Home';
import Registo from './pages/Registo';
import Login from './pages/Login';
import RecuperarPin from './pages/RecuperarPin';
import ClasseUnidades from './pages/ClasseUnidades';
import UnidadeTemas from './pages/UnidadeTemas';
import MinhasUnidades from './pages/MinhasUnidades';
import Perfil from './pages/Perfil';
import AdminLogin from './pages/admin/AdminLogin';
import AdminRecuperar from './pages/admin/AdminRecuperar';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAulasGratuitas from './pages/admin/AdminAulasGratuitas';
import AdminUnidades from './pages/admin/AdminUnidades';
import AdminUnidadeDetalhe from './pages/admin/AdminUnidadeDetalhe';
import AdminPagamentos from './pages/admin/AdminPagamentos';
import AdminPedidos from './pages/admin/AdminPedidos';
import AdminConteudo from './pages/admin/AdminConteudo';
import AdminAlunos from './pages/admin/AdminAlunos';
import AdminConfiguracoes from './pages/admin/AdminConfiguracoes';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';

export default function App() {
  return (
    <ConfigProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/registo" element={<Registo />} />
              <Route path="/entrar" element={<Login />} />
              <Route path="/recuperar-pin" element={<RecuperarPin />} />
              <Route path="/classes/:classeId" element={<ClasseUnidades />} />
              <Route path="/unidades/:unidadeId" element={<UnidadeTemas />} />
              <Route path="/minhas-unidades" element={<MinhasUnidades />} />
              <Route path="/perfil" element={<Perfil />} />

              <Route path="/admin/entrar" element={<AdminLogin />} />
              <Route path="/admin/recuperar" element={<AdminRecuperar />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/aulas-gratuitas"
                element={
                  <ProtectedAdminRoute>
                    <AdminAulasGratuitas />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/unidades"
                element={
                  <ProtectedAdminRoute>
                    <AdminUnidades />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/unidades/:id"
                element={
                  <ProtectedAdminRoute>
                    <AdminUnidadeDetalhe />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/pagamentos"
                element={
                  <ProtectedAdminRoute>
                    <AdminPagamentos />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/pedidos"
                element={
                  <ProtectedAdminRoute>
                    <AdminPedidos />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/conteudo"
                element={
                  <ProtectedAdminRoute>
                    <AdminConteudo />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/alunos"
                element={
                  <ProtectedAdminRoute>
                    <AdminAlunos />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/configuracoes"
                element={
                  <ProtectedAdminRoute>
                    <AdminConfiguracoes />
                  </ProtectedAdminRoute>
                }
              />
              <Route path="/admin/conta" element={<Navigate to="/admin/configuracoes" replace />} />
              <Route
                path="/admin"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </AdminAuthProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}