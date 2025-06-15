/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PACKAGE_VERSION: string;
  readonly VITE_BUILD_HASH: string;
  readonly VITE_BUILD_YEAR: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
