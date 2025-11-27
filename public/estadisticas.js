// estadisticas.js - Gestión de gráficas con Chart.js

let charts = {}; // Guardar instancias de gráficas

// Colores navideños para las gráficas
const coloresNavidad = {
  rojo: 'rgba(245, 61, 153, 0.8)',
  verde: 'rgba(198, 24, 204, 0.8)',
  dorado: 'rgba(10, 168, 241, 0.8)',
  azul: 'rgba(241, 14, 82, 0.8)',
  morado: 'rgba(55, 221, 119, 0.8)',
  turquesa: 'rgba(22, 160, 133, 0.8)',
  
  // Versiones con más transparencia
  rojoTransp: 'rgba(103, 123, 238, 0.6)',
  verdeTransp: 'rgba(5, 240, 103, 0.6)',
  doradoTransp: 'rgba(5, 90, 248, 0.6)',
  azulTransp: 'rgba(151, 5, 73, 0.6)',
  moradoTransp: 'rgba(197, 137, 221, 0.6)',
  turquesaTransp: 'rgba(234, 247, 56, 0.6)',
};

// Paleta de colores variados
const paletaColores = [
  'rgba(168, 28, 13, 0.8)',   // Rojo
  'rgba(39, 174, 96, 0.8)',   // Verde
  'rgba(18, 243, 224, 0.8)',  // Dorado
  'rgba(117, 191, 240, 0.8)',  // Azul
  'rgba(155, 89, 182, 0.8)',  // Morado
  'rgba(155, 22, 160, 0.8)',  // Turquesa
  'rgba(231, 60, 89, 0.8)',   // Rojo claro
  'rgba(9, 110, 51, 0.8)',  // Verde claro
  'rgba(131, 110, 26, 0.8)',  // Amarillo
  'rgba(142, 68, 173, 0.8)',  // Morado oscuro
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
    // Destruir gráficas anteriores
    destruirGraficas();
    
    // Mostrar loading en los cards
    document.getElementById('statTotalVentasCard').textContent = '...';
    document.getElementById('statIngresosCard').textContent = '...';
    document.getElementById('statProductosCard').textContent = '...';
    document.getElementById('statClientesCard').textContent = '...';
    
    // Cargar datos en paralelo
    await Promise.all([
      cargarProductosMasVendidos(),
      cargarUsuariosMasCompras(),
      cargarVentasSemana(),
      cargarIngresosMensuales(),
      cargarTopUsuariosIngresos(),
      cargarStockVsVendido(),
      cargarResumenCards()
    ]);
    
    console.log('✅ Estadísticas cargadas correctamente');
    mostrarNotificacion('Estadísticas actualizadas', 'success');
  } catch (error) {
    console.error('❌ Error cargando estadísticas:', error);
    mostrarNotificacion('Error al cargar estadísticas', 'danger');
  }
}

// 1. Productos Más Vendidos (Barras Horizontales)
async function cargarProductosMasVendidos() {
  try {
    const response = await fetch('/estadisticas/productos-mas-vendidos');
    const data = await response.json();
    
    const ctx = document.getElementById('chartProductosMasVendidos');
    
    charts.productosMasVendidos = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(p => p.nombre),
        datasets: [{
          label: 'Cantidad Vendida',
          data: data.map(p => parseInt(p.cantidad_vendida)),
          backgroundColor: paletaColores,
          borderColor: paletaColores.map(c => c.replace('0.8', '1')),
          borderWidth: 2
        }]
      },
      options: {
        indexAxis: 'y',
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
            color: '#ae2781ff'
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              color: '#0c6ecfff'
            },
            grid: {
              color: 'rgba(11, 241, 107, 0.1)'
            }
          },
          y: {
            ticks: {
              color: '#0667c9ff',
              font: { weight: 'bold' }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error en productos más vendidos:', error);
  }
}

// 2. Usuarios con Más Compras (Barras)
async function cargarUsuariosMasCompras() {
  try {
    const response = await fetch('/estadisticas/usuarios-mas-compras');
    const data = await response.json();
    
    const ctx = document.getElementById('chartUsuariosMasCompras');
    
    charts.usuariosMasCompras = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(u => u.nombre),
        datasets: [{
          label: 'Total de Compras',
          data: data.map(u => parseInt(u.total_compras)),
          backgroundColor: coloresNavidad.dorado,
          borderColor: coloresNavidad.verde,
          borderWidth: 3
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
            text: '👥 Clientes más frecuentes',
            font: { size: 16, weight: 'bold' },
            color: '#12c6f3ff'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              color: '#ec0fe1ff'
            },
            grid: {
              color: 'rgba(14, 243, 167, 0.1)'
            }
          },
          x: {
            ticks: {
              color: '#5f921cff',
              font: { weight: 'bold' }
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
    
    // Formatear fechas
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
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: '#fff',
          pointBorderColor: coloresNavidad.azul,
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
            text: '📅 Tendencia de ventas semanal',
            font: { size: 16, weight: 'bold' },
            color: '#cd34dbff'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              color: '#ca7b99'
            },
            grid: {
              color: 'rgba(52, 152, 219, 0.1)'
            }
          },
          x: {
            ticks: {
              color: '#4fa4faff',
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

// 4. Ingresos Mensuales (Barras)
async function cargarIngresosMensuales() {
  try {
    const response = await fetch('/estadisticas/ingresos-mensuales');
    const data = await response.json();
    
    const ctx = document.getElementById('chartIngresosMensuales');
    
    charts.ingresosMensuales = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(m => m.mes_nombre || m.mes),
        datasets: [{
          label: 'Ingresos ($)',
          data: data.map(m => parseFloat(m.ingresos)),
          backgroundColor: coloresNavidad.rojo,
          borderColor: coloresNavidad.verde,
          borderWidth: 3
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
            color: '#EED9E3',
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + value.toLocaleString();
              },
              color: '#ee66f3ff'
            },
            grid: {
              color: 'rgba(235, 161, 238, 0.1)'
            }
          },
          x: {
            ticks: {
              color: '#D59FB5',
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

// 5. Top Usuarios por Ingresos (Dona)
async function cargarTopUsuariosIngresos() {
  try {
    const response = await fetch('/estadisticas/top-usuarios-ingresos');
    const data = await response.json();
    
    const ctx = document.getElementById('chartTopUsuariosIngresos');
    
    charts.topUsuariosIngresos = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(u => u.nombre),
        datasets: [{
          label: 'Ingresos ($)',
          data: data.map(u => parseFloat(u.ingresos_totales)),
          backgroundColor: paletaColores.slice(0, 5),
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
              color: '#2c3e50',
              font: { size: 12, weight: 'bold' },
              padding: 15
            }
          },
          title: {
            display: true,
            text: '⭐ Mejores clientes',
            font: { size: 16, weight: 'bold' },
            color: '#9b59b6'
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

// 6. Stock vs Vendido (Barras Agrupadas)
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
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#2c3e50',
              font: { size: 12, weight: 'bold' }
            }
          },
          title: {
            display: true,
            text: '📦 Inventario vs Rotación',
            font: { size: 16, weight: 'bold' },
            color: '#01f5c4ff'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              color: '#2c3e50'
            },
            grid: {
              color: 'rgba(22, 160, 133, 0.1)'
            }
          },
          x: {
            ticks: {
              color: '#2c3e50',
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

// Cargar resumen de cards
async function cargarResumenCards() {
  try {
    const response = await fetch('/historial/estadisticas');
    const data = await response.json();
    
    document.getElementById('statTotalVentasCard').textContent = data.total_ventas || 0;
    document.getElementById('statIngresosCard').textContent = '$' + (data.ingresos_totales || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 });
    
    // Calcular productos vendidos
    const productosVendidos = data.productos_mas_vendidos?.reduce((sum, p) => sum + parseInt(p.cantidad_vendida || 0), 0) || 0;
    document.getElementById('statProductosCard').textContent = productosVendidos;
    
    // Obtener clientes activos
    const respUsuarios = await fetch('/estadisticas/usuarios-mas-compras');
    const usuarios = await respUsuarios.json();
    document.getElementById('statClientesCard').textContent = usuarios.length || 0;
    
  } catch (error) {
    console.error('Error cargando resumen:', error);
    document.getElementById('statTotalVentasCard').textContent = '0';
    document.getElementById('statIngresosCard').textContent = '$0';
    document.getElementById('statProductosCard').textContent = '0';
    document.getElementById('statClientesCard').textContent = '0';
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
    success: '#27ae60',
    danger: '#e7b13cff',
    warning: '#a4f312ff',
    info: '#b419d3ff'
  };
  
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-white border-0`;
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

// Event listener para cuando se abre el modal
document.getElementById('modalEstadisticas')?.addEventListener('shown.bs.modal', () => {
  console.log('📊 Modal de estadísticas abierto');
  cargarEstadisticas();
});

// Event listener para cuando se cierra el modal
document.getElementById('modalEstadisticas')?.addEventListener('hidden.bs.modal', () => {
  console.log('🔒 Modal de estadísticas cerrado');
  destruirGraficas();
});