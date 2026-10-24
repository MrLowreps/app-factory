// 記録: 作った料理の一覧。写真と PFC を見返し、共有もできる。
import { useCallback, useEffect, useState } from 'react';
import { deleteRecord, listRecords, type CookRecord } from '../lib/records';
import { Icon } from '../ui/Icon';
import { formatPfc } from '../ui/MacroBars';
import { Sheet } from '../ui/Sheet';
import { useToast } from '../ui/Toast';
import { ShareButton, useObjectUrl } from './CookedSheet';

export function Records() {
  const toast = useToast();
  const [records, setRecords] = useState<CookRecord[] | null>(null);
  const [open, setOpen] = useState<CookRecord | null>(null);

  const reload = useCallback(() => {
    listRecords()
      .then(setRecords)
      .catch(() => setRecords([]));
  }, []);
  useEffect(reload, [reload]);

  const remove = async (record: CookRecord) => {
    if (!window.confirm(`「${record.dishName}」の記録を削除しますか？`)) return;
    await deleteRecord(record.id);
    setOpen(null);
    toast('削除しました');
    reload();
  };

  return (
    <>
      <header className="screen-header">
        <div>
          <p className="eyebrow">作った料理</p>
          <h1>記録</h1>
        </div>
      </header>
      <main className="screen">
        {records?.length === 0 && (
          <div className="card empty">
            <Icon name="records" className="empty-icon" />
            <h2 className="section-title">まだ記録がありません</h2>
            <p className="muted">献立の料理を作ったら「作った！」で写真と一緒に残せます。</p>
          </div>
        )}
        {records?.map((r) => (
          <button type="button" key={r.id} className="card record card-button" onClick={() => setOpen(r)}>
            <RecordPhoto photo={r.photo} />
            <span className="stack stack-tight">
              <span className="dish-name">{r.dishName}</span>
              <span className="muted small">
                {formatDate(r.date)} · {Math.round(r.nutrition.kcal)} kcal · {formatPfc(r.nutrition)}
              </span>
            </span>
          </button>
        ))}
        {records && records.length > 0 && <p className="muted small">記録はこのスマホの中だけに保存されています。ブラウザのデータを消すと記録も消えます。</p>}
      </main>
      {open && (
        <Sheet title={open.dishName} onClose={() => setOpen(null)}>
          <RecordPhoto photo={open.photo} large />
          <p className="muted">
            {formatDate(open.date)} · {Math.round(open.nutrition.kcal)} kcal · {formatPfc(open.nutrition)}
          </p>
          <ShareButton title={open.dishName} nutrition={open.nutrition} photo={open.photo} date={open.date} />
          <button type="button" className="button button-danger button-block" onClick={() => remove(open)}>
            <Icon name="trash" />
            この記録を削除
          </button>
        </Sheet>
      )}
    </>
  );
}

function RecordPhoto({ photo, large }: { photo?: Blob; large?: boolean }) {
  const url = useObjectUrl(photo);
  const className = large ? 'photo-preview' : 'record-photo';
  if (!url)
    return (
      <span className={`${className} record-photo-empty`}>
        <Icon name="bowl" />
      </span>
    );
  return <img className={className} src={url} alt="" />;
}

const formatDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' });
