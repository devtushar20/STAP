import "@/styles/assistant.css";

export default function AssistantLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="assistant-app">{children}</div>;
}
