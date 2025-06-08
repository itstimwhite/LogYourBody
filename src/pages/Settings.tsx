import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Smartphone, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBodyMetrics } from "@/hooks/use-body-metrics";

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useBodyMetrics();

  const [name, setName] = useState(user.name);
  const [gender, setGender] = useState(user.gender);
  const [height, setHeight] = useState(user.height.toString());
  const [birthday, setBirthday] = useState(
    user.birthday.toISOString().split("T")[0],
  );
  const [healthKitEnabled, setHealthKitEnabled] = useState(false);
  const [googleFitEnabled, setGoogleFitEnabled] = useState(false);

  const handleSave = () => {
    updateUser({
      name,
      gender,
      height: parseInt(height),
      birthday: new Date(birthday),
    });
    navigate("/dashboard");
  };

  const formatHeight = (cm: number) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-white/10">
        <Button
          size="icon"
          variant="outline"
          onClick={() => navigate("/dashboard")}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>

      {/* Settings List */}
      <div className="p-6 space-y-8">
        {/* Personal Information */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-white/90 border-b border-white/10 pb-2">
            Personal Information
          </h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white/80 mb-2 block">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div>
              <Label className="text-white/80 mb-2 block">Gender</Label>
              <Select
                value={gender}
                onValueChange={(value: "male" | "female") => setGender(value)}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/20">
                  <SelectItem
                    value="male"
                    className="text-white hover:bg-white/10"
                  >
                    Male
                  </SelectItem>
                  <SelectItem
                    value="female"
                    className="text-white hover:bg-white/10"
                  >
                    Female
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="birthday" className="text-white/80 mb-2 block">
                Birthday
              </Label>
              <Input
                id="birthday"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div>
              <Label htmlFor="height" className="text-white/80 mb-2 block">
                Height (cm)
              </Label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
              <p className="text-white/40 text-sm mt-1">
                {height ? formatHeight(parseInt(height)) : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-white/90 border-b border-white/10 pb-2">
            Integrations
          </h2>

          <div className="space-y-4">
            {/* HealthKit */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium">HealthKit</div>
                  <div className="text-white/60 text-sm">iOS only</div>
                </div>
              </div>
              <Switch
                checked={healthKitEnabled}
                onCheckedChange={setHealthKitEnabled}
              />
            </div>

            {/* Google Fit */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium">Google Fit</div>
                  <div className="text-white/60 text-sm">All platforms</div>
                </div>
              </div>
              <Switch
                checked={googleFitEnabled}
                onCheckedChange={setGoogleFitEnabled}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6">
          <Button
            onClick={handleSave}
            className="w-full bg-white text-black hover:bg-white/90 font-semibold"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
