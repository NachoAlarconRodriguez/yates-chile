import React from 'react';

export const FloatingConcierge: React.FC = () => {
  const whatsappNumber = '56981312920';
  const message = encodeURIComponent(
    'Hola, desearía comunicarme con un Concierge de Yates Chile para consultar sobre expediciones privadas.'
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Atención Concierge por WhatsApp"
      className="fixed bottom-24 right-6 z-50 group w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
    >
      {/* Official WhatsApp SVG Logo Icon */}
      <svg
        className="w-8 h-8 fill-current text-white"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path d="M12.004 2C6.48 2 2 6.48 2 12a9.92 9.92 0 0 0 1.54 5.3L2 22l4.83-1.27A9.97 9.97 0 0 0 12.004 22c5.52 0 10-4.48 10-10s-4.48-10-10-10zm5.27 13.91c-.24.66-1.38 1.27-1.93 1.35-.49.07-1.12.1-3.23-.77a11.16 11.16 0 0 1-4.84-4.25c-.84-1.12-1.34-2.43-1.34-3.8 0-1.39.73-2.07.97-2.33.24-.26.49-.33.66-.33.17 0 .34.01.49.02.16.01.37-.06.58.45.22.52.74 1.8.8 1.93.07.13.11.28.02.46-.09.18-.14.28-.28.45-.14.17-.3.38-.43.51-.15.15-.31.32-.13.63.18.31.81 1.33 1.74 2.16.93.83 1.71 1.09 1.95 1.21.24.12.38.1.52-.06.14-.16.61-.71.77-.95.16-.24.33-.2.55-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.58-.18 1.24z" />
      </svg>
    </a>
  );
};
