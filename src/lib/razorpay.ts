import { toast } from "sonner";

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: any) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export const initializePayment = async (options: RazorpayOptions) => {
  const isLoaded = await loadRazorpayScript();

  if (!isLoaded) {
    toast.error("Razorpay SDK failed to load. Are you online?");
    return;
  }

  const rzp = new (window as any).Razorpay(options);
  rzp.open();
};
