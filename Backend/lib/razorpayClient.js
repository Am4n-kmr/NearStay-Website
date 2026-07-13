import Razorpay from "razorpay";

let instance = null;

export default function getRazorpay() {
  if (instance) return instance;
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  instance = new Razorpay({ key_id, key_secret });
  return instance;
}
