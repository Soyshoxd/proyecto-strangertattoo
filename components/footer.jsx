import React from 'react'
import Logo from "@/assets/LogoStrangerLetras.png"
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="relative h-35 md:h-50">
  <div className="bg-[url('/assets/fondo-footer.jpg')] bg-center bg-cover bg-no-repeat relative overflow-hidden h-full w-full flex flex-col items-center justify-center text-white">
    <div className="absolute inset-0 bg-black opacity-80 z-0"></div>

    <div className="relative z-10 flex flex-col items-center justify-around p-2 w-full">
      
      <div className='flex flex-row justify-between w-full px-3 md:items-center'>
        <div className='w-[30%] '>
          <Image src={Logo} alt="Logo" className="w-22 h-15 md:w-40 md:h-35 object-contain" />
        </div>
        <div className='w-[40%]'>
          <h2 className='text-sm font-monserrat md:text-2xl font-bold'>Horarios</h2>
          <p className='text-xs md:text-xl font-monserrat leading-4'>
            lunes-viernes: 11am-7pm<br/>
            Sábado: 10am-7pm
          </p>
        </div>
        <div className='w-[20%]'>
          <h2 className='text-sm font-monserrat md:text-2xl'>Dirección</h2>
          <p className='text-xs md:text-xl font-monserrat'>Cra. 9 #14-97</p>
        </div>
      </div>

      <div className='flex flex-row items-center justify-between w-full px-4 mt-2 text-xs md:text-xl'>
        <p>©strangertatoo2025</p>
        <p>¡Te esperamos!</p>
      </div>
    </div>
  </div>
</footer>




  )
}

export default Footer