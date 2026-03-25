import { Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from '../../pages/HomePage';
import { JoinPage } from '../../pages/JoinPage';
import { NotFoundPage } from '../../pages/NotFoundPage';
import { OccasionPage } from '../../pages/OccasionPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/join" element={<JoinPage />} />
      <Route path="/occasion/:code" element={<OccasionPage />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
