'use client'

import { auth, db } from "@/lib/firebase-client";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react"
import { FaAngleDown } from "react-icons/fa";
import { FaAngleUp } from "react-icons/fa";
import BotonReseña from "./btn-reseña-product";

const Pedidos = () => {

    const [usuario, setUsuario] = useState(null);
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [pedidoAbierto, setPedidoAbierto] = useState(null);



    const togglePedido = (id) => {
        setPedidoAbierto(pedidoAbierto === id ? null : id);
    };

    //Useeffect para ver la sesion del usuario
    //solo se ejecuta una vez cuando el componente se monta (array de dependencias vacio)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUsuario(user || null);
        });

        return unsubscribe;

    }, [])

    //Useeffect para obtener los pedidos del usuario
    useEffect(() => {
        const cargarPedidos = async () => {
            if (!usuario) {
                setCargando(false);
                setPedidos([]);
                return;
            }

            try {
                const refPedidos = collection(db, 'pedidos');
                const q = query(refPedidos, where('userId', '==', usuario.uid), orderBy('createdAt', 'desc'));
                
                const snapshot = await getDocs(q);
                const pedidosData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPedidos(pedidosData);
            } catch (error) {
                console.error('Error al cargar pedidos:', error);
                setPedidos([]);
            } finally {
                setCargando(false);
            }
        };

        cargarPedidos();
    }, [usuario])

    if (cargando) return <p className="text-white ">Cargando pedidos ...</p>
    if (!usuario) return (
        <div>
            <p className="text-white">Debes iniciar sesion para ver tus pedidos</p>
            <p>Si no tienes una cuenta tus pedidos no se guardan registrarte para guardar tus pedidos</p>
            <button
                onClick={() => router.push('/login')}
                className="bg-zinc-800 text-white py-1 px-4 rounded hover:bg-zinc-700"
            >
                Iniciar sesión
            </button>
            <button
                onClick={() => router.push('/register')}
                className="bg-red-600 text-white py-1 px-4 rounded hover:bg-red-700"
            >
                Registrarse
            </button>
        </div>

    )
    if (pedidos.length === 0) return (
        <div>
            <p className="text-white">No tienes pedidos aún</p>
            <p>Ve a nuestra tienda para hacer tu primera compra</p>
            <Link href="/productos" className="text-red-500 hover:text-red-600 font-semibold">
                ir a la tienda
            </Link>
        </div>
    )



    return (
        <div className="mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 text-white">Tus Pedidos</h1>
            {pedidos.map((pedido) => (
                <div
                    key={pedido.id}
                    className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-4 shadow-md hover:shadow-lg transition-shadow"
                >
                    {/* Cabecera del pedido */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        {/* Info principal */}
                        <div className="space-y-1">
                            <p className="text-gray-300 text-sm">
                                <span className="text-white font-medium">Referencia:</span> {pedido.reference}
                            </p>
                            <p className="text-gray-300 text-sm">
                                <span className="text-white font-medium">Fecha:</span>{" "}
                                {pedido.createdAt
                                    ? typeof pedido.createdAt.toDate === "function"
                                        ? pedido.createdAt.toDate().toLocaleString()
                                        : new Date(pedido.createdAt).toLocaleString()
                                    : "Sin fecha"}
                            </p>
                            <p className="text-gray-300 text-sm">
                                <span className="text-white font-medium">Total:</span>{" "}
                                ${pedido.total.toLocaleString()}
                            </p>
                        </div>

                        {/* Estados y botón */}
                        <div className="flex flex-wrap items-center justify-start md:justify-end gap-2 w-full md:w-auto">
                            {/* Estado de pago */}
                            <span className="text-md text-gray-200">Pago:</span>
                            <span
                                className={`text-center w-20 py-1 rounded-full text-xs font-semibold ${pedido.EstadoPago === "pagado"
                                        ? "bg-green-600 text-white"
                                        : pedido.EstadoPago === "pendiente"
                                            ? "bg-yellow-500 text-white"
                                            : pedido.EstadoPago === "rechazado"
                                                ? "bg-red-600 text-white"
                                                : "bg-gray-600 text-white"
                                    }`}
                            >
                                {pedido.EstadoPago}
                            </span>

                            {/* Estado del pedido */}
                            <span className="text-md text-gray-200 ml-2">Pedido:</span>
                            <span
                                className={`text-center w-20 py-1 rounded-full text-xs font-semibold ${pedido.EstadoPedido === "Preparando"
                                        ? "bg-orange-500 text-white"
                                        : pedido.EstadoPedido === "Listo para recoger"
                                            ? "bg-blue-500 text-white"
                                            : pedido.EstadoPedido === "Entregado"
                                                ? "bg-green-600 text-white"
                                                : "bg-gray-600 text-white"
                                    }`}
                            >
                                {pedido.EstadoPedido}
                            </span>

                            {/* Botón para desplegar */}
                            <button
                                onClick={() => togglePedido(pedido.id)}
                                className=" flex items-center gap-1 text-md text-gray-300 hover:text-white transition-colors"
                            >
                                {pedidoAbierto === pedido.id ? (
                                    <>
                                        <FaAngleUp className="text-lg" /> <span>Ocultar</span>
                                    </>
                                ) : (
                                    <>
                                        <FaAngleDown className="text-lg" /> <span>Detalles</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Detalles desplegables */}
                    {pedidoAbierto === pedido.id && (
                        <div className="mt-4 border-t border-gray-700 pt-3 text-gray-300 text-sm space-y-2">
                            <p className="font-semibold mb-1">Productos:</p>
                            <ul className="list-disc ml-5 space-y-1">
                                {pedido.items?.map((item, i) => (
                                    <li key={i}>
                                        <div>
                                        {item.nombre} — {item.cantidad} × ${item.precio.toLocaleString()}
                                        </div>
                                        <BotonReseña producto={{slug: item.id, nombre: item.nombre}} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ))}

        </div>
    )
}

export default Pedidos