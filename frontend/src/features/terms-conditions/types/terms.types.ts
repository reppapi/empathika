import React from "react";

export interface SectionItem {
  id: string;
  number: string;
  title: string;
  icon: React.ElementType;
}

export interface TermsHeroProps {
  brandName: string;
  withBiro: (path: string) => string;
}

export interface TermsSidebarProps {
  activeSection: string;
  scrollToSection: (id: string) => void;
  email: string;
  waNumber: string;
  displayPhone: string;
}

export interface TermsMobileNavProps {
  activeSection: string;
  scrollToSection: (id: string) => void;
}

export interface TermsIntroCardProps {
  brandName: string;
}

export interface SectionGeneralProps {
  brandName: string;
}

export interface SectionContactProps {
  email: string;
  waNumber: string;
  displayPhone: string;
  copiedContact: string | null;
  copyToClipboard: (text: string, label: string) => void;
}
