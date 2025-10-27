import Image from 'next/image';
import { BsPencilSquare } from "react-icons/bs";
import imgMaquina from '@/assets/maquina.png';
import imgIconoCliente from '@/assets/iconoclientes.png';
import Counter from '@/lib/contador';

export default function Estadisticas() {
  return (
    <section
      className="flex flex-row justify-center text-white mt-4 p-2"
      aria-labelledby="estadisticas-heading"
    >
      {/* Item 1 */}
      <div className="w-40 md:w-50 flex flex-col items-center text-center">
        <div className="w-20 h-15 md:h-20 md:w-30 flex items-center justify-center">
          <Image src={imgMaquina} alt="maquina" className="w-full h-full object-contain" />
        </div>
        <Counter start={5} target={10} suffix=" " />
        <p className="text-sm md:text-2xl">años <br/>de experiencia</p>
      </div>

      {/* Item 2 */}
      <div className="w-40 md:w-50 flex flex-col items-center text-center">
        <div className="w-20 h-15 md:h-20 md:w-30 flex items-center justify-center">
          <Image src={imgIconoCliente} alt="clientes" className="w-full h-full object-contain" />
        </div>
        <Counter start={9000} target={10000} suffix=" clientes" />
        <p className="text-sm md:text-2xl">clientes<br/> satisfechos</p>
      </div>

      {/* Item 3 */}
      <div className="w-40 md:w-50 flex flex-col items-center text-center">
        <div className="w-20 h-15 md:h-20 md:w-30 flex items-center justify-center">
          <BsPencilSquare className="text-4xl md:text-6xl" />
        </div>
        <Counter start={1000} target={5000} />
        <p className="text-sm md:text-2xl">Diseños <br/>personalizados</p>
      </div>

    </section>
  );
}
