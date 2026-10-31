// 오프라인 TSX 구조 검사 전용 최소 React 타입. JSX 속성 타입은 검증하지 않는다(any).
// 실제 타입 검사는 CI의 npm run typecheck(@types/react)에서 수행한다.
declare module "react" {
  export type ReactNode = any;
  export type ReactElement = any;
  export type FC<P = {}> = (props: P) => any;
  export function useEffect(effect: () => void | (() => void), deps?: unknown[]): void;
  const React: any;
  export default React;
}
declare module "react/jsx-runtime" {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}
declare namespace JSX {
  type Element = any;
  interface IntrinsicElements {
    [name: string]: any;
  }
  interface IntrinsicAttributes {
    key?: string | number | null;
  }
  interface ElementChildrenAttribute {
    children: {};
  }
}
declare module "*.css";
