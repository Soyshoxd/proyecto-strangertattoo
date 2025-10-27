# Integración Bold - Stranger Tattoo

## Estado Actual
✅ **Funcional** - Botón de pago Bold implementado correctamente

## Cómo Funciona

### 1. Flujo de Pago
1. Usuario hace clic en "Finalizar compra" en `/carrito`
2. Se llama a `/api/bold-session` para generar orden y firma de integridad
3. Se muestra botón de pago Bold con datos seguros
4. Usuario es redirigido a Bold para completar el pago
5. Bold redirige de vuelta a `/confirmacion` con el resultado

### 2. Archivos Importantes

#### `/app/api/bold-session/route.js`
- Genera orderId único
- Convierte precio a centavos
- Crea firma de integridad SHA256
- Devuelve datos necesarios para Bold

#### `/app/carrito/page.js`
- Maneja la UI del carrito
- Crea botón de pago dinámicamente
- Envía formulario POST a Bold

#### `/app/confirmacion/page.js`
- Procesa resultado del pago
- Limpia carrito en pagos exitosos
- Muestra estados apropiados

#### `/app/api/webhook/bold/route.js`
- Recibe notificaciones de Bold
- Actualiza estado de pedidos en Firebase

### 3. Variables de Entorno Requeridas
```env
BOLD_PRIVATE_KEY=tu_clave_privada_bold
NEXT_PUBLIC_BOLD_API_KEY=tu_clave_publica_bold
```

### 4. URLs Importantes
- **Checkout Bold**: `https://checkout.bold.co/payment`
- **Webhook**: `tu-dominio.com/api/webhook/bold`
- **Redirección**: `tu-dominio.com/confirmacion`

## Seguridad

### Firma de Integridad
Se genera usando SHA256 con:
```
orderId + amountInCents + currency + privateKey
```

### Validaciones
- Verificación de origen en webhook
- Validación de datos en servidor
- Manejo seguro de errores

## Testing

### Datos de Prueba Bold
- Usar claves de sandbox de Bold
- Tarjetas de prueba proporcionadas por Bold
- Verificar webhooks en ambiente de desarrollo

## Troubleshooting

### Problemas Comunes
1. **Firma inválida**: Verificar orden de concatenación
2. **Webhook no llega**: Revisar URL pública y HTTPS
3. **Redirección falla**: Verificar URL completa

### Logs Útiles
```javascript
console.log("Order ID:", orderId);
console.log("Amount in cents:", amountInCents);
console.log("Signature string:", signatureString);
```

## Próximos Pasos
1. ✅ Implementar webhook para actualizar pedidos
2. ✅ Manejar estados de pago (exitoso, fallido, pendiente)
3. 🔄 Configurar ambiente de producción
4. 🔄 Implementar notificaciones por email
