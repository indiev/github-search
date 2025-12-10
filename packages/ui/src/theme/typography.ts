import { Noto_Sans_KR } from "next/font/google";

const primaryFont = Noto_Sans_KR({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-kr",
});

export { primaryFont };
