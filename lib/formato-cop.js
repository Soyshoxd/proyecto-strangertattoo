//funcion para formato de pesos colombians

export function formatoCOP(valor){
    return new Intl.NumberFormat('es-CO',{
        minimumFractionDigits: 0,

    }).format(valor);
}