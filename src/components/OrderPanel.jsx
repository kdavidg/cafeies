import React from 'react';

function OrderPanel({ orderItems, PRODUCTS, orderTotal, orderCount, setCurrentView, setOrderItems, changeQty, finalizarPedido }) {
  
  const handleClear = () => setOrderItems({});

  return (
    <div className="order-panel">
      <div className="order-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid var(--border)' }}>
        <h3 className="order-panel-title" style={{ margin: 0 }}>Tu Pedido</h3>
        {orderCount > 0 && (
          <button onClick={handleClear} style={{ background: '#FFF0EA', border: 'none', color: '#FF5C1A', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
            Limpiar
          </button>
        )}
      </div>

      {/* LISTA DE PRODUCTOS CON SCROLL */}
      <div className="order-items-list" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {Object.entries(orderItems).map(([id, qty]) => {
          const product = PRODUCTS.find(p => String(p.id) === String(id));
          return (
            <div key={id} className="order-item" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px' 
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{product?.name}</span>
                <span style={{ fontWeight: 'bold', color: 'var(--orange)' }}>{(product?.price * qty).toFixed(2)}€</span>
              </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                background: '#F3ECE3', 
                padding: '6px 12px', 
                borderRadius: '12px' 
              }}>
                <button 
                  onClick={() => changeQty(id, -1)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', color: 'var(--text-primary)' }}
                >
                  −
                </button>
                
                <span style={{ fontWeight: 'bold', minWidth: '15px', textAlign: 'center' }}>{qty}</span>
                
                <button 
                  onClick={() => changeQty(id, 1)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', color: 'var(--text-primary)' }}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      
      
      {/* PIE DEL PANEL (FIJO ABAJO) */}
      <div className="order-panel-footer" style={{ padding: '20px', borderTop: '1px solid var(--border)', background: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '18px', fontWeight: '800' }}>
          <span>Total</span>
          <span style={{ color: 'var(--orange)' }}>{orderTotal?.toFixed(2)}€</span>
        </div>
        
        <button
    className="btn-primary"
    onClick={() => setCurrentView('checkout')}
    disabled={orderCount === 0}
    style={{ opacity: orderCount === 0 ? 0.5 : 1, width: '100%' }}
>
    Pagar y Confirmar ({orderTotal.toFixed(2)}€)
</button>
      </div>
    </div>
  );
}

export default OrderPanel;