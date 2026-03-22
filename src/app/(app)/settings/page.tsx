export const metadata = {
  title: "Account",
};

export default function SettingsPlaceholderPage() {
  return (
    <div className="flex w-full min-w-0 flex-col border-b border-black pb-8 sm:pb-10">
      <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-ui-muted-dim">Settings</p>
      <h1 className="mt-3 text-2xl font-medium tracking-[-0.03em] text-ui-text sm:mt-4 sm:text-3xl md:text-4xl">
        Account
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ui-muted sm:mt-6 sm:text-base">
        More account options will be here later. For now, use{" "}
        <span className="font-medium text-ui-text">Log out</span> in the header if you need to switch users.
      </p>
    </div>
  );
}
