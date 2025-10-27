import React from 'react'
import Logo from "@/assets/LogoStrangerLetras.png"
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="relative h-[150px]">
  <div className="bg-[url('/assets/fondo-footer.jpg')] bg-cover relative overflow-hidden h-full w-full flex flex-col items-center justify-center text-white">
    <div className="absolute inset-0 bg-black opacity-70 z-0"></div>

    <div className="relative z-10 flex flex-col items-center justify-around p-2 w-full">
      
      <div className='flex flex-row justify-between w-full px-3'>
        <div className='w-[30%] '>
          <Image src={Logo} alt="Logo" className="w-[90px] h-[35px] object-contain" />
        </div>
        <div className='w-[40%]'>
          <h2 className='text-sm font-monserrat'>Horarios</h2>
          <p className='text-xs font-monserrat leading-4'>
            lunes-viernes: 11am-7pm<br />
            Sábado: 10am-7pm
          </p>
        </div>
        <div className='w-[20%]'>
          <h2 className='text-sm font-monserrat'>Dirección</h2>
          <p className='text-xs font-monserrat'>Cra. 9 #14-97</p>
        </div>
      </div>

      <div className='flex flex-row items-center justify-between w-full px-4 mt-2 text-xs'>
        <p>©strangertatoo2025</p>
        <p>¡Te esperamos!</p>
      </div>
    </div>
  </div>
</footer>




  )
}

export default Footer