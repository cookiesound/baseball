import { Button, Space } from 'antd';
import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from 'react';
import { useEffect, useRef } from 'react';
import './NumberInput.scss';

interface NumberInputProps {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  auxiliaryText?: string;
}

const LENGTH = 4;

function digitsFromValue(value: string): string[] {
  const chars = value.replace(/\D/g, '').slice(0, LENGTH).split('');
  return Array.from({ length: LENGTH }, (_, i) => chars[i] ?? '');
}

export function NumberInput({ value, onChange, onSubmit, disabled, auxiliaryText }: NumberInputProps) {
  const cells = digitsFromValue(value);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    refs.current = refs.current.slice(0, LENGTH);
  }, []);

  const focusAt = (idx: number) => {
    const el = refs.current[idx];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const setCellsAndNotify = (nextCells: string[]) => {
    onChange(nextCells.join(''));
  };

  const handleChange =
    (idx: number) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      const d = e.target.value.replace(/\D/g, '').slice(-1) ?? '';
      const next = [...cells];
      next[idx] = d;
      setCellsAndNotify(next);
      if (d && idx < LENGTH - 1) {
        focusAt(idx + 1);
      }
    };

  const handleKeyDown = (idx: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === 'Backspace') {
      if (!cells[idx] && idx > 0) {
        e.preventDefault();
        const next = [...cells];
        next[idx - 1] = '';
        setCellsAndNotify(next);
        focusAt(idx - 1);
      }
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  const handlePaste = (idx: number) => (e: ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = [...cells];
    let cursor = idx;
    for (const ch of text) {
      if (cursor >= LENGTH) break;
      next[cursor] = ch;
      cursor += 1;
    }
    setCellsAndNotify(next);
    focusAt(Math.min(cursor, LENGTH - 1));
  };

  return (
    <div className="number-input">
      <Space className="number-input__row" size={12} align="center">
        {cells.map((cell, idx) => (
          <input
            key={`digit-${idx}`}
            ref={(el) => {
              refs.current[idx] = el;
            }}
            className="number-input__cell"
            inputMode="numeric"
            maxLength={1}
            value={cell}
            disabled={disabled}
            aria-readonly={disabled}
            onChange={handleChange(idx)}
            onKeyDown={handleKeyDown(idx)}
            onPaste={handlePaste(idx)}
            onFocus={(e) => e.target.select()}
          />
        ))}
        <Button type="primary" size="large" disabled={disabled} onClick={onSubmit} className="number-input__submit">
          제출
        </Button>
      </Space>
      {auxiliaryText ? <div className="number-input__hint">{auxiliaryText}</div> : null}
    </div>
  );
}
