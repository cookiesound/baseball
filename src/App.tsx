import { App as AntdApp, ConfigProvider, theme } from 'antd';
import koKR from 'antd/locale/ko_KR';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ScoreProvider } from './context/ScoreContext';
import { GamePage } from './pages/GamePage/GamePage';
import { MainPage } from './pages/MainPage/MainPage';
import './App.scss';

export default function App() {
  return (
    <ConfigProvider
      locale={koKR}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#7c6cf5',
          borderRadius: 10,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
      }}
    >
      <AntdApp>
        <ScoreProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/game/:difficulty" element={<GamePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ScoreProvider>
      </AntdApp>
    </ConfigProvider>
  );
}
