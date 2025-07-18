import { SCRIPT_BUNDLES } from "../config/script-bundles.js";
import { PAGE_CONFIGS } from "../config/page-configs.js";

class ScriptLoader {
  constructor() {
    this.loadedScripts = new Set();
    this.loadPromises = new Map();
    this.basePath = this.getBasePath();
  }

  getBasePath() {
    const scriptPath = import.meta.url;
    const scriptDir = scriptPath.substring(0, scriptPath.lastIndexOf("/"));
    return scriptDir.replace("/core", "");
  }

  resolveScriptPath(relativePath) {
    if (relativePath.startsWith("./")) {
      return this.basePath + "/" + relativePath.substring(2);
    }
    if (relativePath.startsWith("../")) {
      return this.basePath + "/" + relativePath;
    }
    return relativePath;
  }

  async loadScript(src) {
    const resolvedSrc = this.resolveScriptPath(src);

    if (this.loadedScripts.has(resolvedSrc)) {
      return Promise.resolve();
    }

    if (this.loadPromises.has(resolvedSrc)) {
      return this.loadPromises.get(resolvedSrc);
    }

    const promise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = resolvedSrc;
      script.type = "text/javascript";

      script.onload = () => {
        this.loadedScripts.add(resolvedSrc);
        resolve();
      };

      script.onerror = (error) => {
        reject(new Error(`Failed to load ${src}`));
      };

      document.head.appendChild(script);
    });

    this.loadPromises.set(resolvedSrc, promise);
    return promise;
  }

  async loadBundle(bundleName) {
    const scripts = SCRIPT_BUNDLES[bundleName];
    if (!scripts) {
      throw new Error(`Bundle "${bundleName}" not found`);
    }

    if (Array.isArray(scripts)) {
      for (const script of scripts) {
        await this.loadScript(script);
      }
    } else {
      await this.loadScript(scripts);
    }
  }

  async loadPageScripts(pageName = null) {
    if (!pageName) {
      pageName = window.location.pathname.split("/").pop();
    }

    const config = PAGE_CONFIGS[pageName];
    if (!config) {
      return;
    }

    try {
      for (const bundle of config.bundles) {
        await this.loadBundle(bundle);
      }

      if (config.modules) {
        await Promise.all(
          config.modules.map((module) => {
            const scriptPath = SCRIPT_BUNDLES.modules[module];
            if (!scriptPath) {
              return Promise.resolve();
            }
            return this.loadScript(scriptPath);
          })
        );
      }

      if (config.extras) {
        await Promise.all(config.extras.map((script) => this.loadScript(script)));
      }

      await this.loadBundle("coordinator");

      if (config.page) {
        await this.loadScript(config.page);
      }
    } catch (error) {
      throw error;
    }
  }
}

window.scriptLoader = new ScriptLoader();

window.loadPageScripts = (pageName) => {
  return window.scriptLoader.loadPageScripts(pageName);
};
