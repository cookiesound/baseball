import type { ReactNode } from 'react';
import { Layout, Typography } from 'antd';
import './GameBoard.scss';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

interface GameBoardProps {
  title?: string;
  headerExtra?: ReactNode;
  difficultyBadge?: ReactNode;
  left: ReactNode;
  right: ReactNode;
  footer: ReactNode;
}

export function GameBoard({
  title = 'NUMBER BASEBALL',
  headerExtra,
  difficultyBadge,
  left,
  right,
  footer,
}: GameBoardProps) {
  return (
    <Layout className="game-board">
      <Header className="game-board__header">
        <div className="game-board__header-inner">
          <div className="game-board__top-row">
            <div className="game-board__top-left">{headerExtra}</div>
            <div className="game-board__titles">
              <Title level={2} className="game-board__title">
                {title}
              </Title>
              {difficultyBadge ? <div className="game-board__badge-row">{difficultyBadge}</div> : null}
            </div>
            <div className="game-board__top-right" />
          </div>
        </div>
      </Header>

      <Content className="game-board__content">
        <div className="game-board__grid">
          <section className="game-board__left">{left}</section>
          <aside className="game-board__right">{right}</aside>
        </div>
      </Content>

      <Footer className="game-board__footer">{footer}</Footer>
    </Layout>
  );
}
