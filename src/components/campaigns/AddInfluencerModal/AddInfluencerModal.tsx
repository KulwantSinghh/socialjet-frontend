'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import styles from './AddInfluencerModal.module.css';
import { Button } from '@/components/ui/Button';
import { useCreateInfluencer } from '@/hooks/useCampaignLeads';
import type { CreateCreatorRequest } from '@/types/campaign.types';

interface AddInfluencerModalProps {
  onClose: () => void;
}

const PLATFORM_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
] as const;

interface FormState {
  name: string;
  email: string;
  platforms: string[];
  usernames: Record<string, string>;
  pricing: string;
  whatsapp_number: string;
  age: string;
  location: string;
  niches: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  email: '',
  platforms: [],
  usernames: {},
  pricing: '',
  whatsapp_number: '',
  age: '',
  location: '',
  niches: '',
};

export const AddInfluencerModal = ({ onClose }: AddInfluencerModalProps) => {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const { mutate: createInfluencer, isPending } = useCreateInfluencer();

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  function togglePlatform(value: string) {
    setForm((prev) => {
      const selected = prev.platforms.includes(value);
      const platforms = selected
        ? prev.platforms.filter((p) => p !== value)
        : [...prev.platforms, value];
      const usernames = { ...prev.usernames };
      if (selected) delete usernames[value];
      return { ...prev, platforms, usernames };
    });
  }

  function setUsername(platform: string, value: string) {
    setForm((prev) => ({ ...prev, usernames: { ...prev.usernames, [platform]: value } }));
  }

  const canSubmit =
    form.name.trim() !== '' && form.email.trim() !== '' && form.platforms.length > 0 && !isPending;

  function handleSubmit() {
    if (!canSubmit) return;

    const niches = form.niches
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean);

    const usernames: Record<string, string> = {};
    for (const platform of form.platforms) {
      const handle = form.usernames[platform]?.trim();
      if (handle) usernames[platform] = handle;
    }

    const payload: CreateCreatorRequest = {
      name: form.name.trim(),
      email: form.email.trim(),
      platforms: form.platforms,
      usernames,
      pricing: form.pricing.trim(),
      whatsapp_number: form.whatsapp_number.trim(),
      location: form.location.trim(),
      niches,
      ...(form.age.trim() ? { age: Number(form.age) } : {}),
    };

    createInfluencer(payload, {
      onSuccess: (data) => {
        toast.success(data.message || 'Creator added successfully.');
        onClose();
      },
      onError: (err: unknown) => {
        const e = err as { response?: { data?: { detail?: unknown } } };
        const detail = e?.response?.data?.detail;
        let msg: string;
        if (Array.isArray(detail)) {
          msg = (detail[0] as { msg?: string })?.msg ?? 'Failed to add creator.';
        } else if (typeof detail === 'string') {
          msg = detail;
        } else {
          msg = 'Failed to add creator. Please try again.';
        }
        toast.error(msg);
      },
    });
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog">
        <header className={styles.header}>
          <div>
            <h3 className={styles.title}>Add Influencer</h3>
            <p className={styles.subtitle}>Create a new creator in your roster</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.label}>
              Name <span className={styles.required}>*</span>
            </label>
            <input
              className={styles.input}
              placeholder="Creator name"
              value={form.name}
              onChange={set('name')}
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Email <span className={styles.required}>*</span>
            </label>
            <input
              className={styles.input}
              type="email"
              placeholder="creator@gmail.com"
              value={form.email}
              onChange={set('email')}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Platforms <span className={styles.required}>*</span>
            </label>
            <div className={styles.platformGroup}>
              {PLATFORM_OPTIONS.map((p) => {
                const active = form.platforms.includes(p.value);
                return (
                  <button
                    key={p.value}
                    type="button"
                    className={`${styles.platformChip} ${active ? styles.platformChipActive : ''}`}
                    onClick={() => togglePlatform(p.value)}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {form.platforms.map((platform) => {
            const meta = PLATFORM_OPTIONS.find((p) => p.value === platform);
            return (
              <div className={styles.field} key={platform}>
                <label className={styles.label}>{meta?.label ?? platform} username</label>
                <input
                  className={styles.input}
                  placeholder={`@handle on ${meta?.label ?? platform}`}
                  value={form.usernames[platform] ?? ''}
                  onChange={(e) => setUsername(platform, e.target.value)}
                />
              </div>
            );
          })}

          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>Pricing</label>
              <input
                className={styles.input}
                placeholder="500"
                value={form.pricing}
                onChange={set('pricing')}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Age</label>
              <input
                className={styles.input}
                type="number"
                placeholder="25"
                value={form.age}
                onChange={set('age')}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>WhatsApp number</label>
            <input
              className={styles.input}
              placeholder="+6591234567"
              value={form.whatsapp_number}
              onChange={set('whatsapp_number')}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Location</label>
            <input
              className={styles.input}
              placeholder="Singapore"
              value={form.location}
              onChange={set('location')}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Niches</label>
            <input
              className={styles.input}
              placeholder="Food, Lifestyle, Travel"
              value={form.niches}
              onChange={set('niches')}
            />
            <span className={styles.hint}>Separate multiple niches with commas</span>
          </div>
        </div>

        <footer className={styles.footer}>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit} isLoading={isPending}>
            Add
          </Button>
        </footer>
      </div>
    </div>
  );
};
