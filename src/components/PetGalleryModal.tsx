import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import type { PetBuilderConfig } from '../types';
import { PET_STAGES } from '../utils/pet';
import {
  DEFAULT_PET_BUILDER,
  PET_CHARACTERS,
  getPetAngleImage,
  getPetCharacter,
} from '../utils/petBuilder';
import { Modal } from './Modal';
import { PetBuilder } from './PetBuilder';
import { PetMascot } from './PetMascot';

const FORMS = PET_STAGES.filter((item) => item.stage >= 1);

interface PetGalleryModalProps {
  open: boolean;
  onClose: () => void;
  current: PetBuilderConfig;
  currentStage: number;
}

export function PetGalleryModal({
  open,
  onClose,
  current,
  currentStage,
}: PetGalleryModalProps) {
  const [selected, setSelected] = useState({
    config: current,
    stage: Math.max(0, currentStage),
  });

  const preview: PetBuilderConfig = {
    ...selected.config,
    rotation: 0,
  };
  const character = getPetCharacter(selected.config);
  const stageName = PET_STAGES.find((item) => item.stage === selected.stage)?.name ?? '';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="伙伴形态图鉴"
      size="lg"
      footer={
        <div className="modal-actions">
          <button
            className="button ghost"
            type="button"
            onClick={() => setSelected({ config: current, stage: Math.max(0, currentStage) })}
          >
            <RotateCcw size={15} />
            回到我的伙伴
          </button>
          <button className="button primary" type="button" onClick={onClose}>
            关闭
          </button>
        </div>
      }
    >
      <div className="pet-gallery-preview">
        <div
          className="pet-gallery-stage"
          style={{
            background: `linear-gradient(155deg, var(--surface) 0%, ${preview.secondary} 100%)`,
          }}
        >
          {selected.stage === 0 ? (
            <PetMascot xp={0} mood="happy" size={200} />
          ) : (
            <PetBuilder
              config={preview}
              size={240}
              stage={selected.stage}
              interactive
            />
          )}
        </div>
        <div className="pet-gallery-preview-copy">
          <span className="eyebrow">形态预览</span>
          <h3>
            {selected.stage === 0 ? '火种蛋' : `${character.label} · ${stageName}`}
          </h3>
          <p>
            {selected.stage === 0
              ? '所有伙伴共用同一个火种蛋，累计 200 XP 后孵化成小火苗。蛋形态没有旋转角度，孵化后即可拖动查看八个方向。'
              : '拖动可旋转查看八个角度。配件会按伙伴与形态自动贴合，火种蛋达到 200 XP 后孵化。'}
          </p>
          {selected.stage === 0 ? null : (
            <span className="pet-gallery-tip">点击下方任意缩略图切换伙伴和形态</span>
          )}
        </div>
      </div>

      <div className="pet-gallery-grid">
        <section className="pet-gallery-row">
          <header>
            <strong>火种蛋</strong>
            <small>所有伙伴共用 · 0–199 XP</small>
          </header>
          <div className="pet-gallery-forms">
            <button
              type="button"
              className={`pet-gallery-cell${selected.stage === 0 ? ' active' : ''}`}
              onClick={() => setSelected({ config: current, stage: 0 })}
            >
              <span className="pet-gallery-egg">
                <PetMascot xp={0} mood="happy" size={84} />
              </span>
              <span>火种蛋</span>
            </button>
          </div>
        </section>
        {PET_CHARACTERS.map((item) => (
          <section className="pet-gallery-row" key={item.id}>
            <header>
              <strong>{item.label}</strong>
              <small>{item.id === 'coral-cat' ? '初始伙伴' : '可在工坊选择'}</small>
            </header>
            <div className="pet-gallery-forms">
              {FORMS.map((form) => {
                const active =
                  selected.config.primary === item.primary && selected.stage === form.stage;
                return (
                  <button
                    key={form.stage}
                    type="button"
                    className={`pet-gallery-cell${active ? ' active' : ''}`}
                    onClick={() =>
                      setSelected({
                        config: {
                          ...DEFAULT_PET_BUILDER,
                          primary: item.primary,
                          secondary: item.secondary,
                          decorations: current.decorations ?? [],
                          expression: current.expression ?? 'neutral',
                        },
                        stage: form.stage,
                      })
                    }
                  >
                    <img
                      src={getPetAngleImage(item, 0, form.stage)}
                      alt={`${item.label} ${form.name}`}
                      loading="lazy"
                    />
                    <span>{form.name}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </Modal>
  );
}
