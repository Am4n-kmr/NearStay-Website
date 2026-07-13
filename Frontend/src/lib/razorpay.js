let scriptLoading = null;

export function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve();
  if (scriptLoading) return scriptLoading;

  scriptLoading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
    document.body.appendChild(script);
  });

  return scriptLoading;
}

export async function openRazorpayCheckout({
  key,
  amount,
  currency = "INR",
  orderId,
  name = "NearStay",
  description,
  prefill = {},
  theme = { color: "#0ea5a4" },
  onSuccess,
}) {
  if (!key) {
    throw new Error("Razorpay is not configured");
  }

  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key,
      amount,
      currency,
      name,
      description,
      order_id: orderId,
      prefill,
      theme,
      handler: async (response) => {
        try {
          if (onSuccess) await onSuccess(response);
          resolve(response);
        } catch (err) {
          reject(err);
        }
      },
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled")),
      },
    });

    rzp.on("payment.failed", (response) => {
      reject(new Error(response.error?.description || "Payment failed"));
    });

    rzp.open();
  });
}
