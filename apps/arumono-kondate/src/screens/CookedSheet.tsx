// 「作った！」の記録と、SNS 共有カードの作成。
import { useEffect, useMemo, useState } from 'react';
import { APP } from '../config';
import { dishNutrition, type Dish, type Nutrition } from '../domain/menu';
import { sanitizePhoto } from '../lib/image';
import { newId, saveRecord } from '../lib/records';
import { renderShareCard } from '../lib/shareCard';
import { shareFile } from '../lib/share';
import { Icon } from '../ui/Icon';
import { Sheet } from '../ui/Sheet';
import { useToast } from '../ui/Toast';

export function CookedSheet({ dish, date, onClose }: { dish: Dish; date: string; onClose: () => void }) {
  const toast = useToast();
  const nutrition = useMemo(() => dishNutrition(dish), [dish]);
  const [photo, setPhoto] = useState<Blob | undefined>();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const preview = useObjectUrl(photo);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    try {
      setPhoto(await sanitizePhoto(file));
    } catch {
      toast('写真を読み込めませんでした');
    }
  };

  const save = async () => {
    setBusy(true);
    try {
      await saveRecord({ id: newId(), date, createdAt: new Date().toISOString(), dishName: dish.name, nutrition, photo });
      setSaved(true);
      toast('記録しました');
    } catch {
      toast('記録を保存できませんでした');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet title={saved ? '記録しました' : `${dish.name}を記録`} onClose={onClose}>
      {preview ? (
        <img className="photo-preview" src={preview} alt="料理の写真" />
      ) : (
        <div className="photo-preview record-photo-empty">
          <Icon name="camera" className="empty-icon" />
        </div>
      )}
      {!saved && (
        <>
          <label className="button button-secondary button-block">
            <Icon name="camera" />
            {photo ? '写真を撮り直す' : '写真を追加（任意）'}
            <input className="visually-hidden" type="file" accept="image/*" onChange={(e) => pick(e.target.files?.[0])} />
          </label>
          <p className="muted small">写真の撮影場所などの情報は自動で消してから保存します。</p>
          <button type="button" className="button button-block button-large" onClick={save} disabled={busy}>
            記録する
          </button>
        </>
      )}
      {saved && <ShareButton title={dish.name} nutrition={nutrition} photo={photo} date={date} />}
      {saved && (
        <button type="button" className="button button-ghost button-block" onClick={onClose}>
          閉じる
        </button>
      )}
    </Sheet>
  );
}

export function ShareButton({ title, nutrition, photo, date }: { title: string; nutrition: Nutrition; photo?: Blob; date: string }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const share = async () => {
    setBusy(true);
    try {
      const file = await renderShareCard({ title, nutrition, photo, date });
      const result = await shareFile(file, `${title} ${Math.round(nutrition.kcal)}kcal ${APP.hashtag}`);
      if (result === 'downloaded') toast('画像を保存しました');
    } catch {
      toast('共有用の画像を作れませんでした');
    } finally {
      setBusy(false);
    }
  };
  return (
    <button type="button" className="button button-block button-large" onClick={share} disabled={busy}>
      <Icon name="share" />
      SNSで共有する
    </button>
  );
}

export function useObjectUrl(blob: Blob | undefined): string | undefined {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (!blob) return setUrl(undefined);
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url;
}
