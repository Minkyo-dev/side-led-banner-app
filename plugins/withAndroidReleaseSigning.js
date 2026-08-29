const fs = require("fs");
const path = require("path");
const {
  withAppBuildGradle,
  withGradleProperties,
  withDangerousMod,
} = require("@expo/config-plugins");

const CREDENTIALS_DIR = "credentials";
const CONFIG_FILE = "android-signing.json";

function readSigningConfig(projectRoot) {
  const configPath = path.join(projectRoot, CREDENTIALS_DIR, CONFIG_FILE);
  if (!fs.existsSync(configPath)) return null;
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const keystorePath = path.join(
    projectRoot,
    CREDENTIALS_DIR,
    config.storeFile,
  );
  if (!fs.existsSync(keystorePath)) return null;
  return { ...config, keystorePath };
}

const withKeystoreCopy = (config, signing) =>
  withDangerousMod(config, [
    "android",
    async (config) => {
      const dest = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        signing.storeFile,
      );
      fs.copyFileSync(signing.keystorePath, dest);
      return config;
    },
  ]);

const withSigningGradleProperties = (config, signing) =>
  withGradleProperties(config, (config) => {
    const entries = {
      RELEASE_STORE_FILE: signing.storeFile,
      RELEASE_STORE_PASSWORD: signing.storePassword,
      RELEASE_KEY_ALIAS: signing.keyAlias,
      RELEASE_KEY_PASSWORD: signing.keyPassword,
    };
    for (const [key, value] of Object.entries(entries)) {
      const existing = config.modResults.find(
        (item) => item.type === "property" && item.key === key,
      );
      if (existing) existing.value = value;
      else config.modResults.push({ type: "property", key, value });
    }
    return config;
  });

const withSigningBuildGradle = (config) =>
  withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    if (!contents.includes("RELEASE_STORE_FILE")) {
      contents = contents.replace(
        /(signingConfigs\s*\{\s*\n\s*debug\s*\{[\s\S]*?\n\s*\})/,
        `$1
        release {
            if (project.hasProperty('RELEASE_STORE_FILE')) {
                storeFile file(RELEASE_STORE_FILE)
                storePassword RELEASE_STORE_PASSWORD
                keyAlias RELEASE_KEY_ALIAS
                keyPassword RELEASE_KEY_PASSWORD
            }
        }`,
      );
    }

    contents = contents.replace(
      /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug/,
      "$1signingConfig project.hasProperty('RELEASE_STORE_FILE') ? signingConfigs.release : signingConfigs.debug",
    );

    config.modResults.contents = contents;
    return config;
  });

module.exports = function withAndroidReleaseSigning(config) {
  const signing = readSigningConfig(config._internal?.projectRoot || process.cwd());
  if (!signing) return config;
  config = withKeystoreCopy(config, signing);
  config = withSigningGradleProperties(config, signing);
  config = withSigningBuildGradle(config);
  return config;
};
