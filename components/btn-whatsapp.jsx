import { FaWhatsapp } from "react-icons/fa";
import Link from "next/link";

export default function WhatsAppButton() {
  return (
    <Link
      href="https://wa.me/573046724589?text=Hola,%20quiero%20más%20información"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 text-white p-2 rounded-full shadow-lg hover:bg-green-600 transition-all z-50"
    >
      <FaWhatsapp className="md:text-4xl text-3xl"  />
    </Link>
  );
}
