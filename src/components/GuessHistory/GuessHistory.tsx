import { Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useLayoutEffect, useRef } from 'react';
import type { GuessRecord } from '../../types/gameTypes';
import './GuessHistory.scss';

const { Text } = Typography;

/** 본문에 대략 10행이 보이도록 하는 스크롤 높이(px) — antd small row 기준 */
const TABLE_BODY_SCROLL_Y = 448;

interface GuessHistoryProps {
  attempts: GuessRecord[];
}

export function GuessHistory({ attempts }: GuessHistoryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrolls = attempts.length >= 10;

  useLayoutEffect(() => {
    if (!scrolls || attempts.length === 0) return;
    const body = rootRef.current?.querySelector<HTMLDivElement>('.ant-table-body');
    if (body) {
      body.scrollTop = body.scrollHeight;
    }
  }, [attempts.length, scrolls]);

  const columns: ColumnsType<GuessRecord> = [
    {
      title: '회차',
      dataIndex: 'attempt',
      key: 'attempt',
      width: 72,
      align: 'center',
    },
    {
      title: '입력',
      dataIndex: 'value',
      key: 'value',
      render: (v: string) => (
        <Text strong className="guess-history__guess">
          {v}
        </Text>
      ),
    },
    {
      title: '결과',
      key: 'result',
      align: 'center',
      width: 200,
      className: 'guess-history__col-result',
      render: (_, row) => {
        const cleanMiss = row.strike === 0 && row.ball === 0;
        if (cleanMiss) {
          return (
            <Tag className="guess-history__tag guess-history__tag--out guess-history__tag--result" bordered={false}>
              OUT
            </Tag>
          );
        }
        return (
          <span className="guess-history__sb guess-history__sb--large">
            <Tag className="guess-history__tag guess-history__tag--strike guess-history__tag--result" bordered={false}>
              {row.strike}S
            </Tag>
            <Tag className="guess-history__tag guess-history__tag--ball guess-history__tag--result" bordered={false}>
              {row.ball}B
            </Tag>
          </span>
        );
      },
    },
  ];

  return (
    <div ref={rootRef} className="guess-history">
      <Table<GuessRecord>
        size="small"
        columns={columns}
        dataSource={attempts}
        pagination={false}
        rowKey={(row) => `${row.attempt}-${row.value}`}
        locale={{ emptyText: '아직 입력한 기록이 없습니다.' }}
        className="guess-history__table"
        scroll={scrolls ? { y: TABLE_BODY_SCROLL_Y } : undefined}
      />
    </div>
  );
}
