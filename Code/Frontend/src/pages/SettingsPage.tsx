import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useTheme } from "../hooks/useTheme";
import { useLocale } from "../hooks/useLocale";
import { Sun, Moon, Save, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale, t } = useLocale();
  const [provider, setProvider] = useState("openrouter");
  const [model, setModel] = useState("nvidia/nemotron-3-super-120b-a12b:free");
  const [temperature, setTemperature] = useState("0.7");
  const [apiKey, setApiKey] = useState("");

  const handleSave = async () => {
    try {
      // Save to localStorage for now; backend config endpoint not always available
      localStorage.setItem(
        "llm_config",
        JSON.stringify({ provider, model, temperature: parseFloat(temperature), apiKey: apiKey || undefined }),
      );
      toast.success("Configuration saved");
    } catch {
      toast.error("Failed to save configuration");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--text)]">{t("app.settings")}</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Configure your AI Scientist platform</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>LLM Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="provider">Provider</Label>
              <Input
                id="provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="openrouter, openai, anthropic..."
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="model">Model</Label>
              <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
              />
            </div>
            <Button onClick={handleSave} disabled={!provider || !model} className="gap-2">
              <Save className="h-4 w-4" />
              {t("common.save")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text)]">{t("common.theme")}</p>
                <p className="text-xs text-[var(--text-dim)]">Switch between dark and light mode</p>
              </div>
              <Button variant="outline" size="sm" onClick={toggleTheme} className="gap-2">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === "dark" ? "Light" : "Dark"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text)]">{t("common.language")}</p>
                <p className="text-xs text-[var(--text-dim)]">Choose interface language</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={locale === "en" ? "default" : "outline"}
                  onClick={() => setLocale("en")}
                >
                  EN
                </Button>
                <Button
                  size="sm"
                  variant={locale === "fr" ? "default" : "outline"}
                  onClick={() => setLocale("fr")}
                >
                  FR
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text)]">Reset</p>
                <p className="text-xs text-[var(--text-dim)]">Restore default settings</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-[var(--text-dim)]"
                onClick={() => {
                  setProvider("openrouter");
                  setModel("nvidia/nemotron-3-super-120b-a12b:free");
                  setTemperature("0.7");
                  setApiKey("");
                  localStorage.removeItem("llm_config");
                  toast.success("Settings reset to defaults");
                }}
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;