// アプリの名前や文言の設定。名前を変えるときはここと index.html の <title>、factory.json を変える。
export const APP = {
  name: 'あるもの献立',
  tagline: '冷蔵庫にあるもので、目標どおりの1日を。',
  /** 1日に AI で献立を作れる回数 (端末ごと) */
  dailyMenuLimit: 3,
  hashtag: '#あるもの献立',
  /** プライバシーポリシー・利用規約に載せる運営者名と問い合わせ先 */
  // TODO(公開前): 問い合わせ先 (専用メールか Google フォーム) を決めて差し替える
  operator: 'Mr 低レップ',
  contact: { label: 'お問い合わせ先（準備中）', url: '' },
  /** プライバシーポリシー・利用規約の制定日・改定日 */
  legalUpdated: '2026年10月25日',
};
