// ModalAviso.jsx
export default function ModalAviso({ isOpen, onClose, onInvitado, onLogin }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl max-w-md text-center shadow-lg">
        <h2 className="text-lg font-bold mb-3">¿Cómo deseas continuar?</h2>
        <p className="text-sm text-gray-600 mb-6">
          Si continúas como invitado, tu carrito se guardará solo en este navegador y se perderá si lo cierras. ¿Prefieres iniciar sesión?
        </p>
        <div className="flex justify-center gap-4">
          <button onClick={onInvitado} className="bg-gray-800 text-white px-4 py-2 rounded-lg">
            Continuar como invitado
          </button>
          <button onClick={onLogin} className="bg-red-600 text-white px-4 py-2 rounded-lg">
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
