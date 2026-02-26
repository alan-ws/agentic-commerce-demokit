import { brand } from "@/config/brand";

export const metadata = { title: `${brand.name} Widget` };

export default function McpRenderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
