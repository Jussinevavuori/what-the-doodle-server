/**
 * Function to configure the environment
 */
export function configureEnvironment(
  options: {
    skipInProduction?: boolean;
  } = {}
) {
  const env = process.env.NODE_ENV;

  // Handle skipping in production
  if (options.skipInProduction && env === "production") {
    return;
  }

  // Try configuring
  try {
    const dotenv = require("dotenv");
    const path = !env || env === "production" ? `.env` : `.env.${env}`;
    dotenv.config({ path });
  } catch (e) {
    console.warn("An error occured while configuring environment", e);
  }
}

/**
 * Object which contains all configuration values.
 */
export const ENV = {
  /**
   * Host names
   */
  hosts: {
    get client() {
      return ENV_STR("HOSTS_CLIENT");
    },
    get server() {
      return ENV_STR("HOSTS_SERVER");
    },
  },

  /**
   * Application port
   */
  get port() {
    return ENV_NUM("PORT") || 8080;
  },

  /**
   * Application environment
   */
  get env() {
    return ENV_STR("NODE_ENV");
  },
};

/**
 * Helper function for fetching environment variables from process.env and
 * parsing it as a number.
 */
function ENV_NUM(variable: string) {
  return Number(process.env[variable] || "");
}

/**
 * Helper function for fetching environment variables from process.env and
 * leaving it as is as a string.
 */
function ENV_STR(variable: string) {
  return process.env[variable] || "";
}

/**
 * Helper function for fetching environment variables from process.env and
 * parsing it as an array of strings, separated by the specified delimiter.
 * The default delimiter is ";"
 */
function ENV_ARRAY(variable: string, delimiter: string = ";") {
  return (process.env[variable] || "").split(delimiter);
}
