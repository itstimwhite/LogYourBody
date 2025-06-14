import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WeightLoggingFlowV2 } from "./WeightLoggingFlowV2";
import {
  type WeightData,
  type BodyFatData,
  type MethodData,
} from "@/schemas/weight-logging";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import heic2any from "heic2any";

interface WeightLoggingWrapperProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: {
    weight: number;
    bodyFatPercentage: number;
    method: any;
    date: Date;
    photoUrl?: string;
  }) => void;
  units: "metric" | "imperial";
  initialWeight?: number;
  initialBodyFat?: number;
}

export function WeightLoggingWrapper({
  show,
  onClose,
  onSave,
  units,
  initialWeight,
  initialBodyFat,
}: WeightLoggingWrapperProps) {
  const { user } = useAuth();

  const handleComplete = async (data: {
    weight: WeightData;
    bodyFat: BodyFatData;
    method: MethodData;
    photo?: File;
  }) => {
    let photoUrl: string | undefined;

    if (data.photo && supabase && user) {
      try {
        let uploadFile: File | Blob = data.photo;
        if (
          data.photo.type === "image/heic" ||
          data.photo.type === "image/heif" ||
          /\.heic$/i.test(data.photo.name)
        ) {
          const converted = await heic2any({
            blob: data.photo,
            toType: "image/jpeg",
            quality: 0.9,
          });
          uploadFile = new File(
            [converted as BlobPart],
            data.photo.name.replace(/\.heic$/i, ".jpg"),
            { type: "image/jpeg" },
          );
        }

        const filePath = `${user.id}/${Date.now()}_${(uploadFile as File).name}`;
        const { error } = await supabase.storage
          .from("progress-photos")
          .upload(filePath, uploadFile);
        if (!error) {
          const { data: urlData } = supabase.storage
            .from("progress-photos")
            .getPublicUrl(filePath);
          photoUrl = urlData.publicUrl;
        } else {
          console.error("Photo upload error", error);
        }
      } catch (err) {
        console.error("Failed to process photo", err);
      }
    }

    onSave({
      weight: data.weight.value,
      bodyFatPercentage: data.bodyFat.value,
      method: {
        value: data.method.value,
        label: data.method.label,
      },
      date: new Date(),
      photoUrl,
    });
    onClose();
  };

  // Prepare initial data for the flow
  const initialData = {
    weight: initialWeight
      ? {
          value: initialWeight,
          unit: units === "imperial" ? ("lbs" as const) : ("kg" as const),
        }
      : undefined,
    bodyFat: initialBodyFat
      ? {
          value: initialBodyFat,
        }
      : undefined,
    method: undefined,
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <WeightLoggingFlowV2
            onComplete={handleComplete}
            onCancel={onClose}
            initialData={initialData}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
