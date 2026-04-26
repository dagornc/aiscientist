import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useTheme } from "../hooks/useTheme";
import { useLocale } from "../hooks/useLocale";
import { Sun, Moon, Save } from "lucide-react";
import { useState } from "react";

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale, t } = useLocale();
  const [provider, setProvider] = useState("openrouter");
  const [model, setModel] = useState("nvidia/nemotron-3-super-120b-a12b:free");
  const [temperature, setTemperature] = useState("0.7");
  const [apiKey, setApiKey] = useState("");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--text)]">{t("app.settings")}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LLM Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>LLM Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="provider">Provider</Label>
              <Input id="provider" value={provider} onChange={(e) => setProvider(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="model">Model</Label>
              <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="temperature">Temperature</Label>
              <Input id="temperature" type="number" step="0.1" min="0" max="2" value={temperature} onChange={(e) => setTemperature(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="apiKey">API Key</Label>
              <Input id="apiKey" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." />
            </div>
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Save Configuration
            </Button>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text)]">Theme</p>
                <p className="text-xs text-[var(--text-dim)]">Switch between dark and light mode</p>
              </div>
              <Button variant="outline" size="sm" onClick={toggleTheme} className="gap-2">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === "dark" ? "Light" : "Dark"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text)]">Language</p>
                <p className="text-xs text-[var(--text-dim)]">Choose interface language</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant={locale === "en" ? "default" : "outline"} onClick={() => setLocale("en")}>
                  EN
                </Button>
                <Button size="sm" variant={locale === "fr" ? "default" : "outline"} onClick={() => setLocale("fr")}>
                  FR
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
