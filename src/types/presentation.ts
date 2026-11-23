export interface SlideMeta {
  index: number; // 0..8 for the 9 topic pages
  numberLabel: string; // '01'..'09'
  id: string;
  title: string;
  shortTitle: string;
  category: string;
  summary: string;
}

export interface CoverMeta {
  eyebrow: string;
  title: string;
  subtitle: string;
  presenter: string;
}
