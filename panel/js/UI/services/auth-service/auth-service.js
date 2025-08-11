import { generatePKCE } from "../../../../../utils/generatePKCE.js";
import ReportPortalService from "../report-portal-service/report-portal-service.js";

const CLIENT_ID = "katalon-recorder";

export const REDIRECT_URI = `chrome-extension://${chrome.runtime.id}/katalon/authenticated.html`;

// Fixed authentication endpoints for Report Portal
const REPORT_PORTAL_BASE_URL = "https://reporting.linkfields.com";
const AUTH_BASE_ENDPOINT = `${REPORT_PORTAL_BASE_URL}/api/auth`;
const LOGIN_URL = `${REPORT_PORTAL_BASE_URL}/ui/#login`;
const LOGOUT_URL = `${AUTH_BASE_ENDPOINT}/logout`;
const GET_TOKEN_URL = `${AUTH_BASE_ENDPOINT}/token`;

export default class AuthService {
  static async getUniversalLoginUrl() {
    try {
      const codeChallenge = (await generatePKCE()).code_challenge;
      const url = `${LOGIN_URL}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=openid&code_challenge=${codeChallenge}&code_challenge_method=S256`;
      return url;
    } catch (error) {
      console.error("Failed to generate login URL:", error);
      // Fallback to direct login page
      return `${REPORT_PORTAL_BASE_URL}/ui/#login`;
    }
  }

  static async openUniversalLoginUrl() {
    try {
      const url = await this.getUniversalLoginUrl();
      await browser.windows.create({
        url: url,
        type: "popup",
        width: 800,
        height: 600,
        focused: true,
      });
    } catch (error) {
      console.error("Failed to open login window:", error);
      // Fallback to direct login
      await browser.windows.create({
        url: `${REPORT_PORTAL_BASE_URL}/ui/#login`,
        type: "popup",
        width: 800,
        height: 600,
        focused: true,
      });
    }
  }

  static async logout() {
    try {
      const refreshToken = (await browser.storage.local.get("refreshToken"))
        .refreshToken;
      if (!refreshToken) {
        console.log("No refresh token found for logout");
        return;
      }

      const formData = new URLSearchParams();
      formData.append("refresh_token", refreshToken);
      formData.append("client_id", CLIENT_ID);
      
      return fetch(LOGOUT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });
    } catch (error) {
      console.error("Logout failed:", error);
      // Clear local tokens even if server logout fails
      await browser.storage.local.remove("refreshToken");
      await browser.storage.local.remove("codePKCE");
    }
  }

  static async getToken(codeParam) {
    try {
      const codeVerifier = (await browser.storage.local.get("codePKCE")).codePKCE
        .code_verifier;

      const formData = new URLSearchParams();
      formData.append("code", codeParam);
      formData.append("grant_type", "authorization_code");
      formData.append("client_id", CLIENT_ID);
      formData.append("redirect_uri", REDIRECT_URI);
      formData.append("code_verifier", codeVerifier);

      return fetch(GET_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });
    } catch (error) {
      console.error("Failed to get token:", error);
      throw error;
    }
  }

  static async connectRecorderToPortal() {
    try {
      await ReportPortalService.connectRecorderToPortal();
      console.log("Recorder successfully connected to report portal");
    } catch (error) {
      console.error("Failed to connect recorder to portal:", error);
      // Don't throw the error as this is not critical for the login process
    }
  }

  // New method to handle direct login without OAuth flow
  static async handleDirectLogin(email, password) {
    try {
      const response = await fetch(`${REPORT_PORTAL_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Direct login failed:", error);
      throw error;
    }
  }
}
