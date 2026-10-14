/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly SITE_URL?: string;
    readonly SITE_NAME?: string;
    readonly ADSENSE_PUBLISHER_ID?: string;
    readonly GA_ID?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
