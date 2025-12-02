// estadisticas.js - Gestión de gráficas con Chart.js

let charts = {}; // Guardar instancias de gráficas

// Colores navideños para las gráficas
const coloresNavidad = {
  rojo: 'rgba(246, 104, 136, 0.8)',
  verde: 'rgba(99, 123, 91, 0.8)',
  dorado: 'rgba(163, 170, 95, 0.8)',
  azul: 'rgba(174, 228, 196, 0.8)',
  morado: 'rgba(245, 142, 131, 0.8)',
  turquesa: 'rgba(152, 186, 163, 0.8)',
  
  // Versiones con más transparencia
  rojoTransp: 'rgba(246, 104, 136, 0.6)',
  verdeTransp: 'rgba(99, 123, 91, 0.6)',
  doradoTransp: 'rgba(163, 170, 95, 0.6)',
  azulTransp: 'rgba(174, 228, 196, 0.6)',
  moradoTransp: 'rgba(245, 142, 131, 0.6)',
  turquesaTransp: 'rgba(152, 186, 163, 0.6)',
};

// Paleta de colores variados
const paletaColores = [
  'rgba(99, 123, 91, 0.8)',
  'rgba(163, 170, 95, 0.8)',
  'rgba(174, 228, 196, 0.8)',
  'rgba(245, 142, 131, 0.8)',
  'rgba(246, 104, 136, 0.8)',
  'rgba(152, 186, 163, 0.8)',
  'rgba(120, 145, 110, 0.8)',
  'rgba(200, 205, 130, 0.8)',
  'rgba(255, 180, 190, 0.8)',
  'rgba(210, 240, 220, 0.8)',
];

// Función para destruir gráficas existentes
function destruirGraficas() {
  Object.keys(charts).forEach(key => {
    if (charts[key]) {
      charts[key].destroy();
    }
  });
  charts = {};
}

// Cargar todas las estadísticas
async function cargarEstadisticas() {
  console.log('📊 Cargando estadísticas...');
  
  try {
    destruirGraficas();
    
    await Promise.all([
      cargarProductosMasVendidos(),
      cargarUsuariosMasCompras(),
      cargarVentasSemana(),
      cargarIngresosMensuales(),
      cargarTopUsuariosIngresos(),
      cargarStockVsVendido()
    ]);
    
    console.log('✅ Estadísticas cargadas correctamente');
    mostrarNotificacion('Estadísticas actualizadas', 'success');
  } catch (error) {
    console.error('❌ Error cargando estadísticas:', error);
    mostrarNotificacion('Error al cargar estadísticas', 'danger');
  }
}

// 1. Productos Más Vendidos (Radar)
async function cargarProductosMasVendidos() {
  try {
    const response = await fetch('/estadisticas/productos-mas-vendidos');
    const data = await response.json();
    
    const ctx = document.getElementById('chartProductosMasVendidos');
    
    charts.productosMasVendidos = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: data.map(p => p.nombre),
        datasets: [{
          label: 'Cantidad Vendida',
          data: data.map(p => parseInt(p.cantidad_vendida)),
          backgroundColor: 'rgba(99, 123, 91, 0.3)',
          borderColor: 'rgba(99, 123, 91, 0.8)',
          borderWidth: 3,
          pointBackgroundColor: paletaColores,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: '🥖 Panes más populares',
            font: { size: 16, weight: 'bold' },
            color: '#637b5b'
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              color: '#a3aa5f'
            },
            grid: {
              color: 'rgba(174, 228, 196, 0.1)'
            },
            pointLabels: {
              color: '#637b5b',
              font: { weight: 'bold', size: 11 }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error en productos más vendidos:', error);
  }
}

// 2. Usuarios con Más Compras (Polar)
async function cargarUsuariosMasCompras() {
  try {
    const response = await fetch('/estadisticas/usuarios-mas-compras');
    const data = await response.json();
    
    const ctx = document.getElementById('chartUsuariosMasCompras');
    
    charts.usuariosMasCompras = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels: data.map(u => u.nombre),
        datasets: [{
          label: 'Total de Compras',
          data: data.map(u => parseInt(u.total_compras)),
          backgroundColor: paletaColores.slice(0, data.length),
          borderColor: '#fff',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#637b5b',
              font: { size: 11, weight: 'bold' }
            }
          },
          title: {
            display: true,
            text: '👥 Clientes más frecuentes',
            font: { size: 16, weight: 'bold' },
            color: '#a3aa5f'
          }
        },
        scales: {
          r: {
            ticks: {
              stepSize: 1,
              color: '#f58e83',
              backdropColor: 'transparent'
            },
            grid: {
              color: 'rgba(174, 228, 196, 0.1)'
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error en usuarios más compras:', error);
  }
}

// 3. Ventas Última Semana (Línea)
async function cargarVentasSemana() {
  try {
    const response = await fetch('/estadisticas/ventas-ultima-semana');
    const data = await response.json();
    
    const ctx = document.getElementById('chartVentasSemana');
    
    const labels = data.map(v => {
      const fecha = new Date(v.fecha);
      return fecha.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' });
    });
    
    charts.ventasSemana = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Ventas',
          data: data.map(v => parseInt(v.total_ventas)),
          backgroundColor: coloresNavidad.azulTransp,
          borderColor: coloresNavidad.azul,
          borderWidth: 4,
          fill: true,
          tension: 0.4,
          pointRadius: 7,
          pointHoverRadius: 10,
          pointBackgroundColor: '#fff',
          pointBorderColor: coloresNavidad.azul,
          pointBorderWidth: 4,
          pointStyle: 'circle'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: '📅 ❄️ Tendencia de ventas semanal',
            font: { size: 16, weight: 'bold' },
            color: '#637b5b'
          },
          filler: {
            propagate: true
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              color: '#f58e83'
            },
            grid: {
              color: 'rgba(174, 228, 196, 0.1)'
            }
          },
          x: {
            ticks: {
              color: '#a3aa5f',
              font: { weight: 'bold' }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error en ventas semana:', error);
  }
}

// 4. Ingresos Mensuales (Línea)
async function cargarIngresosMensuales() {
  try {
    const response = await fetch('/estadisticas/ingresos-mensuales');
    const data = await response.json();
    
    const ctx = document.getElementById('chartIngresosMensuales');
    
    charts.ingresosMensuales = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(m => m.mes_nombre || m.mes),
        datasets: [{
          label: 'Ingresos ($)',
          data: data.map(m => parseFloat(m.ingresos)),
          backgroundColor: 'rgba(246, 104, 136, 0.2)',
          borderColor: coloresNavidad.rojo,
          borderWidth: 4,
          fill: true,
          tension: 0.3,
          pointRadius: 8,
          pointHoverRadius: 12,
          pointBackgroundColor: coloresNavidad.verde,
          pointBorderColor: '#fff',
          pointBorderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: '💰 Evolución de ingresos',
            font: { size: 16, weight: 'bold' },
            color: '#f66888'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + value.toLocaleString();
              },
              color: '#f58e83'
            },
            grid: {
              color: 'rgba(174, 228, 196, 0.1)'
            }
          },
          x: {
            ticks: {
              color: '#a3aa5f',
              font: { weight: 'bold' }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error en ingresos mensuales:', error);
  }
}

// 5. Top Usuarios por Ingresos (Pie)
async function cargarTopUsuariosIngresos() {
  try {
    const response = await fetch('/estadisticas/top-usuarios-ingresos');
    const data = await response.json();
    
    const ctx = document.getElementById('chartTopUsuariosIngresos');
    
    charts.topUsuariosIngresos = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: data.map(u => u.nombre),
        datasets: [{
          label: 'Ingresos ($)',
          data: data.map(u => parseFloat(u.ingresos_totales)),
          backgroundColor: paletaColores.slice(0, 5),
          borderColor: '#fff',
          borderWidth: 4,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#637b5b',
              font: { size: 12, weight: 'bold' },
              padding: 15
            }
          },
          title: {
            display: true,
            text: '⭐ ❄️ Mejores clientes',
            font: { size: 16, weight: 'bold' },
            color: '#f66888'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.label + ': $' + context.parsed.toLocaleString();
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error en top usuarios ingresos:', error);
  }
}

// 6. Stock vs Vendido (Barras Horizontales)
async function cargarStockVsVendido() {
  try {
    const response = await fetch('/estadisticas/stock-vs-vendido');
    const data = await response.json();
    
    const ctx = document.getElementById('chartStockVsVendido');
    
    charts.stockVsVendido = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(p => p.nombre),
        datasets: [
          {
            label: 'Stock Actual',
            data: data.map(p => parseInt(p.stock_actual)),
            backgroundColor: coloresNavidad.turquesa,
            borderColor: coloresNavidad.turquesa.replace('0.8', '1'),
            borderWidth: 2
          },
          {
            label: 'Cantidad Vendida',
            data: data.map(p => parseInt(p.cantidad_vendida)),
            backgroundColor: coloresNavidad.morado,
            borderColor: coloresNavidad.morado.replace('0.8', '1'),
            borderWidth: 2
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#637b5b',
              font: { size: 12, weight: 'bold' }
            }
          },
          title: {
            display: true,
            text: ' 🎄 Inventario vs Rotación',
            font: { size: 16, weight: 'bold' },
            color: '#aee4c4'
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              color: '#637b5b'
            },
            grid: {
              color: 'rgba(152, 186, 163, 0.1)'
            }
          },
          y: {
            ticks: {
              color: '#637b5b',
              font: { weight: 'bold' }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error en stock vs vendido:', error);
  }
}

// Función auxiliar para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'success') {
  const iconos = {
    success: 'bi-check-circle-fill',
    danger: 'bi-exclamation-triangle-fill',
    warning: 'bi-exclamation-circle-fill',
    info: 'bi-info-circle-fill'
  };
  
  const colores = {
    success: '#a3aa5f',
    danger: '#f58e83',
    warning: '#f66888',
    info: '#aee4c4'
  };
  
  const toast = document.createElement('div');
  toast.className = 'toast align-items-center text-white border-0';
  toast.style.background = colores[tipo];
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <i class="bi ${iconos[tipo]}"></i> ${mensaje}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  
  document.getElementById('toast-container').appendChild(toast);
  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();
  
  setTimeout(() => toast.remove(), 5000);
}

// Event listeners
document.getElementById('modalEstadisticas')?.addEventListener('shown.bs.modal', () => {
  console.log('📊 🎄 Modal de estadísticas abierto');
  cargarEstadisticas();
});

document.getElementById('modalEstadisticas')?.addEventListener('hidden.bs.modal', () => {
  console.log('🔒 Modal de estadísticas cerrado');
  destruirGraficas();
});