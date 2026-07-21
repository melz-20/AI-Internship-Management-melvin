import { FiBell, FiLock, FiMoon, FiShield } from 'react-icons/fi';
import type { AppSettings } from '../../types/settings';
import { Button } from '../../components/ui/Primitives';
import { PageHeader } from '../../components/shared/Common';
import { useToast } from '../../hooks/useToast';
import { useSettings } from '../../app/providers/SettingsContext';

function Toggle({ value, onChange }: { value: boolean; onChange: (x: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative h-6 w-11 rounded-full transition ${
        value ? 'bg-violet-600' : 'bg-slate-200'
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
          value ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const toast = useToast();

  const save = async () => {
    toast.push('Settings saved successfully');
  };

  const setting = (key: keyof AppSettings, label: string, desc: string, icon: React.ReactNode) => (
    <div className="flex items-center gap-4 border-b border-slate-100 py-5 last:border-0">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
        {icon}
      </span>
      <div className="flex-1">
        <b className="block text-sm">{label}</b>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
      {typeof settings[key] === 'boolean' && (
        <Toggle
          value={settings[key] as boolean}
          onChange={(v) => updateSettings({ [key]: v })}
        />
      )}
    </div>
  );

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your workspace preferences and account security."
        action={<Button onClick={save}>Save changes</Button>}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="font-bold">Appearance</h2>
          <div className="mt-3">
            {setting(
              'theme',
              'Theme preference',
              'Choose how the admin workspace looks.',
              <FiMoon />
            )}
            <select
              value={settings.theme}
              onChange={(e) =>
                updateSettings({ theme: e.target.value as AppSettings['theme'] })
              }
              className="input mt-3"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System preference</option>
            </select>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-bold">Notifications</h2>
          {setting(
            'emailNotifications',
            'Email notifications',
            'Receive important platform updates by email.',
            <FiBell />
          )}
          {setting(
            'weeklySummary',
            'Weekly summary',
            'Receive a weekly system summary.',
            <FiBell />
          )}
        </section>

        <section className="card p-6">
          <h2 className="font-bold">Security</h2>
          {setting(
            'loginAlerts',
            'Login alerts',
            'Get alerted when your account is accessed.',
            <FiShield />
          )}
          {setting(
            'twoFactorAuth',
            'Two-factor authentication',
            'Add an extra layer of security to your account.',
            <FiLock />
          )}
        </section>

        <section className="card p-6">
          <h2 className="font-bold">Preferences</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Language</label>
              <select className="input mt-1">
                <option>English</option>
                <option>Hindi</option>
                <option>Spanish</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Timezone</label>
              <select className="input mt-1">
                <option>IST (UTC+5:30)</option>
                <option>UTC</option>
                <option>EST (UTC-5)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Session timeout (minutes)
              </label>
              <input type="number" defaultValue={30} min={5} max={480} className="input mt-1" />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
