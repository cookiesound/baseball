import {
  AppstoreOutlined,
  LeftOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  NumberOutlined,
} from '@ant-design/icons';
import { App as AntdApp, Button, ConfigProvider, Layout, Menu, theme, Typography } from 'antd';
import koKR from 'antd/locale/ko_KR';
import { useMemo, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { ScoreProvider } from './context/ScoreContext';
import { GamePage } from './pages/GamePage/GamePage';
import { MainPage } from './pages/MainPage/MainPage';
import { NumberBaseballPage } from './pages/NumberBaseballPage/NumberBaseballPage';
import { AppleGamePage } from './pages/AppleGamePage/AppleGamePage';
import './App.scss';

const { Sider, Content } = Layout;
const { Text } = Typography;

function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const selectedKeys = useMemo(() => {
    if (location.pathname.startsWith('/apple')) return ['apple'];
    if (location.pathname.startsWith('/number-baseball') || location.pathname.startsWith('/game/')) {
      return ['number-baseball'];
    }
    return [];
  }, [location.pathname]);

  return (
    <Layout className="app-shell">
      <Sider
        className="app-shell__sider"
        width={240}
        collapsedWidth={72}
        collapsible
        collapsed={collapsed}
        trigger={null}
      >
        <div className={`app-shell__brand${collapsed ? ' app-shell__brand--collapsed' : ''}`}>
          {!collapsed ? (
            <div className="app-shell__brand-left">
              <AppstoreOutlined />
              <Text className="app-shell__brand-text">MINI GAMES</Text>
            </div>
          ) : null}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed((prev) => !prev)}
            className="app-shell__toggle-btn"
          />
        </div>

        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          className="app-shell__menu"
          items={[
            {
              key: 'number-baseball',
              icon: <NumberOutlined />,
              label: '숫자 야구 게임',
              onClick: () => navigate('/number-baseball'),
            },
            {
              key: 'apple',
              icon: <AppstoreOutlined />,
              label: '사과 게임',
              onClick: () => navigate('/apple'),
            },
          ]}
        />
      </Sider>

      <Layout className="app-shell__main">
        <div className="app-shell__mobile-back">
          <Button
            icon={<LeftOutlined />}
            onClick={() => setCollapsed((prev) => !prev)}
            className="app-shell__mobile-btn"
          >
            메뉴
          </Button>
        </div>
        <Content className="app-shell__content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

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
              <Route element={<AppShell />}>
                <Route path="/" element={<MainPage />} />
                <Route path="/number-baseball" element={<NumberBaseballPage />} />
                <Route path="/game/:difficulty" element={<GamePage />} />
                <Route path="/apple" element={<AppleGamePage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ScoreProvider>
      </AntdApp>
    </ConfigProvider>
  );
}
