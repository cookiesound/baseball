import { CloseCircleOutlined, LockOutlined } from '@ant-design/icons';
import { Card, Empty, Tag, Typography } from 'antd';
import './InferencePanel.scss';

const { Text, Title } = Typography;

interface InferencePanelProps {
  confirmed: string[];
  excluded: string[];
  emptyHistory: boolean;
}

export function InferencePanel({ confirmed, excluded, emptyHistory }: InferencePanelProps) {
  return (
    <Card className="inference-panel" bordered={false}>
      <div className="inference-panel__block">
        <Title level={5} className="inference-panel__title">
          <LockOutlined className="inference-panel__title-icon inference-panel__title-icon--ok" />
          확정 숫자
        </Title>
        <Text type="secondary" className="inference-panel__desc">
          현재 기록과 호환되는 모든 정답 후보에 공통으로 들어가는 숫자입니다. (자리는 미정)
        </Text>
        {emptyHistory ? (
          <Empty className="inference-panel__empty" image={Empty.PRESENTED_IMAGE_SIMPLE} description="기록이 있으면 분석됩니다." />
        ) : confirmed.length === 0 ? (
          <div className="inference-panel__none">
            <Text type="secondary">아직 논리적으로 확정된 숫자가 없습니다.</Text>
          </div>
        ) : (
          <div className="inference-panel__tags">
            {confirmed.map((d) => (
              <Tag key={d} className="inference-panel__tag inference-panel__tag--confirmed" bordered={false}>
                {d}
              </Tag>
            ))}
          </div>
        )}
      </div>

      <div className="inference-panel__divider" />

      <div className="inference-panel__block">
        <Title level={5} className="inference-panel__title">
          <CloseCircleOutlined className="inference-panel__title-icon inference-panel__title-icon--no" />
          제외 숫자
        </Title>
        <Text type="secondary" className="inference-panel__desc">
          가능한 정답 후보 어디에도 나오지 않는 숫자입니다.
        </Text>
        {emptyHistory ? (
          <Empty className="inference-panel__empty" image={Empty.PRESENTED_IMAGE_SIMPLE} description="기록이 있으면 분석됩니다." />
        ) : excluded.length === 0 ? (
          <div className="inference-panel__none">
            <Text type="secondary">아직 논리적으로 제외할 숫자가 없습니다.</Text>
          </div>
        ) : (
          <div className="inference-panel__tags">
            {excluded.map((d) => (
              <Tag key={d} className="inference-panel__tag inference-panel__tag--excluded" bordered={false}>
                {d}
              </Tag>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
