import React from "react";

export interface SectionItem {
  id: string;
  number: string;
  title: string;
  icon: React.ElementType;
}

export interface PrivacyHeroProps {
  brandName: string;
  withBiro: (path: string) => string;
}

export interface PrivacySidebarProps {
  activeSection: string;
  scrollToSection: (id: string) => void;
  email: string;
  waNumber: string;
  displayPhone: string;
}

export interface PrivacyMobileNavProps {
  activeSection: string;
  scrollToSection: (id: string) => void;
}

export interface PrivacyIntroCardProps {
  brandName: string;
}

export interface SectionUserRightsProps {
  email: string;
}

export interface SectionContactInfoProps {
  email: string;
  waNumber: string;
  displayPhone: string;
  copiedContact: string | null;
  copyToClipboard: (text: string, label: string) => void;
}
