"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTenantContext } from "@/context/TenantContext";
import { useAdminContact } from "@/hooks/useAdminContact";
import { SECTIONS } from "../../constants/privacy.constants";
import PrivacyHero from "./PrivacyHero";
import PrivacySidebar from "./PrivacySidebar";
import PrivacyMobileNav from "./PrivacyMobileNav";
import PrivacyIntroCard from "./PrivacyIntroCard";
import SectionInformationCollected from "./sections/SectionInformationCollected";
import SectionInformationUsage from "./sections/SectionInformationUsage";
import SectionDataProtection from "./sections/SectionDataProtection";
import SectionThirdParties from "./sections/SectionThirdParties";
import SectionUserRights from "./sections/SectionUserRights";
import SectionPolicyChanges from "./sections/SectionPolicyChanges";
import SectionContactInfo from "./sections/SectionContactInfo";

export default function PrivacyPolicyClient() {
  const { isBiro, biroProfile, withBiro } = useTenantContext();
  const { email, waNumber, displayPhone } = useAdminContact();
  const [activeSection, setActiveSection] = useState<string>("informasi-dihimpun");
  const [copiedContact, setCopiedContact] = useState<string | null>(null);

  const brandName = isBiro && biroProfile?.nama_biro ? biroProfile.nama_biro : "Empathika";

  const isManualScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-highlight TOC saat pengguna melakukan scrolling alami
  useEffect(() => {
    const handleScroll = () => {
      if (isManualScrollingRef.current) return;

      const scrollPosition = window.scrollY + 160;

      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const sec = SECTIONS[i];
        const el = document.getElementById(sec.id);
        if (el) {
          if (el.offsetTop <= scrollPosition) {
            setActiveSection(sec.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      isManualScrollingRef.current = true;
      setActiveSection(id);

      el.scrollIntoView({ behavior: "smooth", block: "start" });

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isManualScrollingRef.current = false;
      }, 850);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedContact(label);
    setTimeout(() => setCopiedContact(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#faf8fb] text-gray-800 antialiased selection:bg-[#561269]/10 selection:text-[#561269]">
      {/* Hero Banner Section */}
      <PrivacyHero brandName={brandName} withBiro={withBiro} />

      {/* Main Content + Sticky Sidebar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Desktop Sticky Sidebar */}
          <PrivacySidebar
            activeSection={activeSection}
            scrollToSection={scrollToSection}
            email={email}
            waNumber={waNumber}
            displayPhone={displayPhone}
          />

          {/* Main Content Area */}
          <main className="lg:col-span-8 space-y-8">
            {/* Mobile / Tablet Horizontal Navigation Bar */}
            <PrivacyMobileNav
              activeSection={activeSection}
              scrollToSection={scrollToSection}
            />

            {/* Opening Intro Statement */}
            <PrivacyIntroCard brandName={brandName} />

            {/* Section 1: Informasi yang Kami Himpun */}
            <SectionInformationCollected />

            {/* Section 2: Penggunaan Informasi */}
            <SectionInformationUsage />

            {/* Section 3: Perlindungan Data */}
            <SectionDataProtection />

            {/* Section 4: Keterlibatan Pihak Ketiga */}
            <SectionThirdParties />

            {/* Section 5: Hak dan Kendali Pengguna */}
            <SectionUserRights email={email} />

            {/* Section 6: Perubahan Kebijakan */}
            <SectionPolicyChanges />

            {/* Section 7: Hubungi Kami */}
            <SectionContactInfo
              email={email}
              waNumber={waNumber}
              displayPhone={displayPhone}
              copiedContact={copiedContact}
              copyToClipboard={copyToClipboard}
            />
          </main>
        </div>
      </section>
    </div>
  );
}
