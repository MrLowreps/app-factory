// プライバシーポリシー・利用規約の表示。文面は content/legal.ts にある。
import { APP } from '../config';
import { LEGAL, LEGAL_TITLE, type LegalDoc } from '../content/legal';
import { Sheet } from '../ui/Sheet';

export function LegalSheet({ doc, onClose }: { doc: LegalDoc; onClose: () => void }) {
  return (
    <Sheet title={LEGAL_TITLE[doc]} onClose={onClose}>
      <div className="legal">
        {LEGAL[doc].map((section) => (
          <section key={section.heading} className="legal-section">
            <h3 className="section-title">{section.heading}</h3>
            {section.body.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </section>
        ))}
        {APP.contact.url && (
          <a className="button button-secondary button-block" href={APP.contact.url} target="_blank" rel="noopener noreferrer">
            お問い合わせ
          </a>
        )}
        <p className="muted small">
          {APP.operator} ／ 制定・改定日 {APP.legalUpdated}
        </p>
      </div>
    </Sheet>
  );
}

/** 「利用規約」「プライバシーポリシー」を開くリンク風のボタン */
export function LegalLinks({ onOpen }: { onOpen: (doc: LegalDoc) => void }) {
  return (
    <span className="legal-links">
      {(Object.keys(LEGAL_TITLE) as LegalDoc[]).map((doc) => (
        <button key={doc} type="button" className="text-button" onClick={() => onOpen(doc)}>
          {LEGAL_TITLE[doc]}
        </button>
      ))}
    </span>
  );
}
