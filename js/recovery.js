// Password recovery: Wix sends the reset email; phone requests go to the admin queue.
import { wixRequest } from "/js/wix/client.js";
import { WIX_CLIENT_ID } from "/js/wix/config.js";

export async function sendRecovery(email) {
  await wixRequest("/_api/iam/recovery/v1/send-email", {
    body: { email: email, redirect: { url: location.origin + "/login.html?reset=done", clientId: WIX_CLIENT_ID } }
  });
}
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_RE = /^0(3|5|7|8|9)\d{8}$/;
export const normPhone = (v) => String(v || "").replace(/[\s.-]/g, "").replace(/^\+?84/, "0");