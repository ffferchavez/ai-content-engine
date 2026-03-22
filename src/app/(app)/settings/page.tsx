export const metadata = {
  title: "Account",
};

export default function SettingsPlaceholderPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight text-white">Account</h1>
      <p className="text-base leading-relaxed text-helion-muted">
        More account options will be here later. For now, use{" "}
        <span className="text-helion-text">Log out</span> in the top corner if you need to switch users.
      </p>
    </div>
  );
}
