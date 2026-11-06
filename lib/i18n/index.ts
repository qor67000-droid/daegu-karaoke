import type { IntlLocaleKey } from "@/lib/i18n/locales";
import type { LocaleContent } from "@/lib/i18n/types";
import { en } from "@/lib/i18n/content/en";
import { ja } from "@/lib/i18n/content/ja";
import { zhCn } from "@/lib/i18n/content/zh-cn";
import { zhTw } from "@/lib/i18n/content/zh-tw";
import { zhHk } from "@/lib/i18n/content/zh-hk";

/** 언어별 페이지 콘텐츠. 새 언어는 여기에 추가하고 lib/i18n/locales.ts 에서 status 를 관리한다. */
export const CONTENT: Record<IntlLocaleKey, LocaleContent> = { ja, en, "zh-cn": zhCn, "zh-tw": zhTw, "zh-hk": zhHk };
export const getContent = (key: IntlLocaleKey) => CONTENT[key];

export * from "@/lib/i18n/locales";
