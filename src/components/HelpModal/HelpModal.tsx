import { InfoCircleOutlined } from '@ant-design/icons';
import { Modal, Typography } from 'antd';
import './HelpModal.scss';

const { Paragraph, Title, Text } = Typography;

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

export function HelpModal({ open, onClose }: HelpModalProps) {
  return (
    <Modal
      open={open}
      title={
        <span className="help-modal__title">
          <InfoCircleOutlined /> 게임 안내
        </span>
      }
      onCancel={onClose}
      footer={null}
      width={640}
      className="help-modal"
      destroyOnClose
    >
      <div className="help-modal__body">
        <section>
          <Title level={5}>숫자 야구 규칙</Title>
          <Paragraph>
            0~9 중 <Text strong>중복 없는 4자리</Text>가 정답으로 정해집니다. 같은 조건으로 4자리를 맞추면 됩니다.
          </Paragraph>
        </section>

        <section>
          <Title level={5}>Strike / Ball / Out</Title>
          <ul className="help-modal__list">
            <li>
              <Text strong className="help-modal__strike">
                Strike
              </Text>
              : 숫자와 자리가 모두 일치
            </li>
            <li>
              <Text strong className="help-modal__ball">
                Ball
              </Text>
              : 숫자는 있으나 자리가 다름
            </li>
            <li>
              <Text strong className="help-modal__out">
                Out
              </Text>
              : 일치하는 숫자가 없음 (0S 0B)
            </li>
          </ul>
        </section>

        <section>
          <Title level={5}>난이도 차이</Title>
          <ul className="help-modal__list">
            <li>
              <Text strong>쉬움</Text>: 입력 숫자 중복·이미 낸 조합 차단, 우측 <Text strong>추천 숫자 3개</Text> 힌트, 제한 없음, 점수
              가장 낮음
            </li>
            <li>
              <Text strong>보통</Text>: 쉬움과 동일하게 <Text strong>중복·재입력 차단</Text>, 힌트 없음, 제한 없음, 중간 점수
            </li>
            <li>
              <Text strong>어려움</Text>: 경고 없음, 힌트 없음, <Text strong>반드시 7회 안에</Text> 맞춰야 하며{' '}
              <Text type="danger" strong>
                7회 내에 실패하면 -100점
              </Text>
              이 반영되고 게임이 종료됩니다. 대신 클리어 시 가장 높은 점수를 받습니다.
            </li>
          </ul>
        </section>

        <section>
          <Title level={5}>점수 기준</Title>
          <Paragraph className="help-modal__mono">
            Easy — 1회 50 · 2회 40 · 3회 30 · 4회 20 · 5회 10 · 6회+ 5
            <br />
            Normal — 1회 100 · 2회 80 · 3회 60 · 4회 40 · 5회 20 · 6회+ 10
            <br />
            Hard — 1회 300 · 2회 250 · 3회 200 · 4회 150 · 5회 100 · 6회 50 · 7회 30 ·{' '}
            <Text type="danger" strong>
              실패 -100
            </Text>
          </Paragraph>
        </section>
      </div>
    </Modal>
  );
}
