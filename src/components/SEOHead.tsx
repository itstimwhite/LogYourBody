import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export function SEOHead({
  title = "LogYourBody - Track Your Body Composition with Precision",
  description = "Professional body composition tracking app. Monitor body fat percentage, weight, FFMI, and lean body mass with advanced analytics. Start your 3-day free trial today.",
  keywords = "body composition, body fat tracker, FFMI calculator, weight tracking, fitness app",
  image = "/placeholder.svg",
  url,
  type = "website",
}: SEOHeadProps) {
  const location = useLocation();
  const currentUrl = url || `${window.location.origin}${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta description
    updateMetaTag("description", description);
    updateMetaTag("keywords", keywords);

    // Update Open Graph tags
    updateMetaProperty("og:title", title);
    updateMetaProperty("og:description", description);
    updateMetaProperty("og:image", image);
    updateMetaProperty("og:url", currentUrl);
    updateMetaProperty("og:type", type);

    // Update Twitter tags
    updateMetaProperty("twitter:title", title);
    updateMetaProperty("twitter:description", description);
    updateMetaProperty("twitter:image", image);

    // Update canonical URL
    updateCanonicalUrl(currentUrl);
  }, [title, description, keywords, image, currentUrl, type]);

  return null;
}

function updateMetaTag(name: string, content: string) {
  let element = document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function updateMetaProperty(property: string, content: string) {
  let element = document.querySelector(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function updateCanonicalUrl(url: string) {
  let element = document.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", url);
}

// Page-specific SEO configurations
export const SEO_PAGES = {
  splash: {
    title: "Welcome to LogYourBody - Professional Body Composition Tracking",
    description:
      "Start your journey to better body composition tracking. Monitor body fat, weight, FFMI, and lean body mass with precision. 3-day free trial available.",
    keywords:
      "body composition tracker, fitness app, health tracking, body fat percentage, weight tracking",
  },
  login: {
    title: "Sign In to LogYourBody - Access Your Body Composition Data",
    description:
      "Sign in to LogYourBody to access your body composition tracking dashboard. Monitor your progress with advanced analytics and insights.",
    keywords: "login, sign in, body composition, fitness tracking, health app",
  },
  dashboard: {
    title: "Dashboard - LogYourBody Body Composition Tracker",
    description:
      "Your personal body composition dashboard. View real-time metrics including body fat percentage, weight, FFMI, and lean body mass tracking.",
    keywords:
      "dashboard, body metrics, fitness tracking, body composition analytics",
  },
  settings: {
    title: "Settings - LogYourBody Profile & Preferences",
    description:
      "Manage your LogYourBody profile settings, units preferences, and health app integrations. Customize your body composition tracking experience.",
    keywords: "settings, profile, preferences, health app sync, units",
  },
  subscription: {
    title: "LogYourBody Premium - Advanced Body Composition Tracking",
    description:
      "Unlock premium features with LogYourBody subscription. Advanced analytics, unlimited measurements, photo tracking, and priority support.",
    keywords:
      "premium, subscription, advanced features, body composition analytics",
  },
  terms: {
    title: "Terms of Service - LogYourBody",
    description:
      "Read LogYourBody's terms of service and user agreement for our body composition tracking application.",
    keywords: "terms of service, user agreement, legal",
  },
  privacy: {
    title: "Privacy Policy - LogYourBody",
    description:
      "Learn how LogYourBody protects your privacy and handles your body composition and health data securely.",
    keywords: "privacy policy, data protection, health data security",
  },
};
