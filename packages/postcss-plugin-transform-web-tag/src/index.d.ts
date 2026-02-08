export interface Options {
  tagMap?: Record<string, string>;
  logType?: 'all' | 'repeat' | null;
}
export default function transformWebTag(options?: undefined | Options): void;
