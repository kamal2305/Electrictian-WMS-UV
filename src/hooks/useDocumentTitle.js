import { useEffect } from 'react';

/**
 * Custom hook to dynamically update document title and meta description for SEO
 * @param {string} title - Page specific title
 * @param {string} [description] - Page specific meta description
 */
export const useDocumentTitle = (title, description) => {
  useEffect(() => {
    const baseTitle = 'ElectroTrack WMS';
    document.title = title ? `${title} | ${baseTitle}` : `${baseTitle} — Electrician Workforce Management`;

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }
  }, [title, description]);
};

export default useDocumentTitle;
