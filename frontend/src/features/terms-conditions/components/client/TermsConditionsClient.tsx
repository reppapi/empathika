"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTenantContext } from "@/context/TenantContext";
import { useAdminContact } from "@/hooks/useAdminContact";
import { SECTIONS } from "../../constants/terms.constants";
import TermsHero from "./TermsHero";
import TermsSidebar from "./TermsSidebar";
import TermsMobileNav from "./TermsMobileNav";
import TermsIntroCard from "./TermsIntroCard";
import SectionGeneral from "./sections/SectionGeneral";
import SectionEligibility from "./sections/SectionEligibility";
import SectionProcedure from "./sections/SectionProcedure";
import SectionPayment from "./sections/SectionPayment";
import SectionReschedule from "./sections/SectionReschedule";
import SectionEthics from "./sections/SectionEthics";
import SectionLiability from "./sections/SectionLiability";
import SectionContact from "./sections/SectionContact";

export default function TermsConditionsClient() {
  const { isBiro, biroProfile, withBiro } = useTenantContext();
  const { email, waNumber, displayPhone } = useAdminContact();
  const [activeSection, setActiveSection] = useState<string>("ketentuan-umum");
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
      {/* Hero Banner */}
      <TermsHero brandName={brandName} withBiro={withBiro} />

      {/* Main Content + Sticky Sidebar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Desktop Sticky Sidebar */}
          <TermsSidebar
            activeSection={activeSection}
            scrollToSection={scrollToSection}
            email={email}
            waNumber={waNumber}
            displayPhone={displayPhone}
          />

          {/* Main Content Area */}
          <main className="lg:col-span-8 space-y-8">
            {/* Mobile / Tablet Horizontal Navigation */}
            <TermsMobileNav
              activeSection={activeSection}
              scrollToSection={scrollToSection}
            />

            {/* Intro Statement Card */}
            <TermsIntroCard brandName={brandName} />

            {/* Articles (Section 1 - 8) */}
            <SectionGeneral brandName={brandName} />
            <SectionEligibility />
            <SectionProcedure />
            <SectionPayment />
            <SectionReschedule />
            <SectionEthics />
            <SectionLiability />
            <SectionContact
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
