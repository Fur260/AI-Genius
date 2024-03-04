"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export const CrispChat = () => {
  useEffect(() => {
    Crisp.configure("c2a2ec54-ea6f-453e-9c45-7e00a82f704b");
  }, []);

  return null;
};
