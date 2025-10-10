export default function PiMusiqWireframes({
  initialTab = "docs",
}: { initialTab?: "docs" | "studio" }) {
  const [tab, setTab] = useState<"docs" | "studio">(initialTab);
