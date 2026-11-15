import { useState } from 'react';
import { Check, Dices, RotateCcw, Sparkles } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Pet, PetBuilderConfig } from '../types';
import {
  DEFAULT_PET_BUILDER,
  EXPRESSION_OPTIONS,
  PET_CHARACTERS,
  PET_DECORATION_GROUPS,
  TAIL_OPTIONS,
  configForCharacter,
  getPetCharacter,
  randomPetBuilder,
} from '../utils/petBuilder';
import { Modal } from './Modal';
import { PetBuilder } from './PetBuilder';
import { getPetStage } from '../utils/pet';

interface PetBuilderModalProps {
  pet: Pet;
  open: boolean;
  onClose: () => void;
}

export function PetBuilderModal({ pet, open, onClose }: PetBuilderModalProps) {
  const setCustomPet = useAppStore((state) => state.setCustomPet);
  const [name, setName] = useState(pet.name);
  const [config, setConfig] = useState<PetBuilderConfig>(
    pet.customBuilder ?? DEFAULT_PET_BUILDER,
  );
  const selectedCharacter = getPetCharacter(config);

  const save = () => {
    setCustomPet({
      name: name.trim() || pet.name,
      accent: config.primary,
      builder: config,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="伙伴工坊"
      size="lg"
      footer={
        <div className="modal-actions">
          <button className="button ghost" type="button" onClick={onClose}>
            取消
          </button>
          <button className="button primary" type="button" onClick={save}>
            <Sparkles size={16} />
            保存伙伴
          </button>
        </div>
      }
    >
      <div className="pet-builder-layout">
        <aside className="pet-builder-preview">
          <div
            className="pet-builder-stage"
            style={{
              background: `linear-gradient(155deg, var(--surface) 0%, ${config.secondary} 100%)`,
            }}
          >
            <PetBuilder
              config={config}
              size={280}
              stage={getPetStage(pet.xp).stage}
              interactive
              onRotationChange={(rotation) => setConfig((current) => ({ ...current, rotation }))}
            />
          </div>
          <p className="pet-rotation-tip">拖动旋转 · 双击回正 · 方向键微调</p>
          <label className="field">
            <span>伙伴名字</span>
            <input
              className="plain-input"
              value={name}
              maxLength={12}
              onChange={(event) => setName(event.target.value)}
              placeholder="给它起个名字"
            />
          </label>
          <div className="pet-builder-preview-actions">
            <button
              className="button ghost"
              type="button"
              onClick={() => setConfig(randomPetBuilder())}
            >
              <Dices size={15} />
              随机一只
            </button>
            <button
              className="text-link"
              type="button"
              onClick={() => setConfig(DEFAULT_PET_BUILDER)}
            >
              <RotateCcw size={14} />
              恢复默认
            </button>
          </div>
          <p className="hint-text">
            保存后会保留当前进化阶段、等级和已装备配饰，外观可以随时回来修改。
          </p>
        </aside>

        <div className="pet-builder-controls">
          <section className="builder-section">
            <span className="builder-label">选择伙伴</span>
            <div className="pet-character-grid">
              {PET_CHARACTERS.map((character) => {
                const active = character.id === selectedCharacter.id;
                return (
                  <button
                    key={character.id}
                    className={`pet-character-card${active ? ' active' : ''}`}
                    type="button"
                    onClick={() => setConfig((current) => configForCharacter(character, current))}
                    aria-pressed={active}
                  >
                    <span
                      className="pet-character-thumb"
                      style={{ background: `linear-gradient(145deg, var(--surface), ${character.secondary})` }}
                    >
                      <img src={character.image} alt="" loading="lazy" />
                    </span>
                    <strong>{character.label}</strong>
                    {active ? <Check className="pet-character-check" size={15} /> : null}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="builder-section">
            <span className="builder-label">选择尾巴</span>
            <div className="builder-chips">
              {TAIL_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`builder-chip${config.tail === option.value ? ' active' : ''}`}
                  onClick={() => setConfig((current) => ({ ...current, tail: option.value }))}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="hint-text">伙伴配色会与尾巴自动搭配，不再需要拼装五官。</p>
          </section>

          <section className="builder-section">
            <span className="builder-label">表情预览</span>
            <div className="builder-chips">
              {EXPRESSION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`builder-chip${(config.expression ?? 'neutral') === option.value ? ' active' : ''}`}
                  onClick={() => setConfig((current) => ({ ...current, expression: option.value }))}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          {PET_DECORATION_GROUPS.map((group) => (
            <section className="builder-section" key={group.slot}>
              <span className="builder-label">{group.label}装饰</span>
              <div className="builder-chips">
                <button
                  type="button"
                  className={`builder-chip${!group.options.some((option) => (config.decorations ?? []).includes(option.id)) ? ' active' : ''}`}
                  onClick={() => setConfig((current) => ({
                    ...current,
                    decorations: (current.decorations ?? []).filter(
                      (id) => !group.options.some((option) => option.id === id),
                    ),
                  }))}
                >
                  无
                </button>
                {group.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`builder-chip${(config.decorations ?? []).includes(option.id) ? ' active' : ''}`}
                    onClick={() => setConfig((current) => ({
                      ...current,
                      decorations: [
                        ...(current.decorations ?? []).filter(
                          (id) => !group.options.some((item) => item.id === id),
                        ),
                        option.id,
                      ],
                    }))}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </Modal>
  );
}
