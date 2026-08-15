// utils/generarPDFReunion.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ============================================================
// Helpers de formato
// ============================================================
const formatearFecha = (fecha) => {
  if (!fecha) return '';
  try {
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return '';
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    return `${dia}/${mes}/${anio}`;
  } catch (e) {
    return '';
  }
};

const nombreCompleto = (persona) => {
  if (!persona) return '';
  const nombre = persona.nombre || '';
  const apellido = persona.apellido || '';
  return `${nombre} ${apellido}`.trim();
};

// ============================================================
// Generador principal
// ============================================================
export const generarPDFReunion = (reunion, invitados, tareas, empresa = {}) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ============================================================
  // COLORES UNIFORMES PARA TODAS LAS TABLAS
  // ============================================================
  const COLOR_TITULO = [52, 73, 94];        // Azul oscuro
  const COLOR_FONDO = [236, 240, 241];      // Gris claro
  const COLOR_NUMEROS = [52, 73, 94];       // Azul oscuro (para números)
  const BLANCO = [255, 255, 255];
  const NEGRO = [0, 0, 0];

  // ========================================================
  // ENCABEZADO CON LOGO/NOMBRE DE EMPRESA
  // ========================================================
  if (empresa.logoBase64) {
    try {
      doc.addImage(empresa.logoBase64, 'JPEG', margin, y, 30, 20);
    } catch (e) {
      console.warn('Error al cargar logo:', e);
    }
  }

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  
  if (empresa.logoBase64) {
    doc.line(margin + 35, y, margin + 35, y + 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...NEGRO);
    doc.text(
      empresa.nombre || 'DISTRIBUCIONES AUTOPARTES GARCIA JIMENEZ S.A. DE C.V.',
      margin + 40,
      y + 11,
      { maxWidth: contentWidth - 40 }
    );
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...NEGRO);
    doc.text(
      empresa.nombre || 'DISTRIBUCIONES AUTOPARTES GARCIA JIMENEZ S.A. DE C.V.',
      pageWidth / 2,
      y + 10,
      { align: 'center' }
    );
  }

  y += 25;

  // ========================================================
  // TABLA 1: PENDIENTES / ASISTENTES
  // ========================================================
  const listaAsistentes = (invitados || [])
    .map((inv) => nombreCompleto(inv.usuario || inv))
    .filter(Boolean)
    .join(', ');

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      valign: 'middle',
    },
    body: [
      [
        { 
          content: 'PENDIENTES', 
          colSpan: 3, 
          styles: { 
            halign: 'center', 
            fontStyle: 'bold', 
            fillColor: COLOR_TITULO,
            textColor: BLANCO,
            fontSize: 10
          } 
        }
      ],
      [
        { 
          content: 'ASISTENTES', 
          styles: { 
            fontStyle: 'bold', 
            halign: 'center',
            fillColor: COLOR_TITULO,
            textColor: BLANCO
          } 
        },
        { 
          content: listaAsistentes || 'Sin asistentes registrados',
          styles: {
            fillColor: COLOR_FONDO
          }
        },
        { 
          content: formatearFecha(reunion.fecha || reunion.reu_fecha), 
          styles: { 
            halign: 'center',
            fillColor: COLOR_FONDO
          } 
        },
      ],
    ],
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: contentWidth - 25 - 30 },
      2: { cellWidth: 30 },
    },
  });

  y = doc.lastAutoTable.finalY + 10;

  // ========================================================
  // TABLA 2: ORDEN DEL DIA
  // ========================================================
  const lugar = reunion.lugar || reunion.reu_lugar || '';
  const tema = reunion.nombre || reunion.reu_nombre || '';
  const lugarTema = lugar && tema ? `${lugar}. Tema: ${tema}` : (tema || lugar || '');

  const filasOrdenDia = [
    [
      { 
        content: '1', 
        styles: { 
          halign: 'center', 
          fontStyle: 'bold', 
          fillColor: COLOR_NUMEROS,
          textColor: BLANCO
        } 
      },
      { 
        content: lugarTema || '', 
        styles: { 
          halign: 'left',
          fillColor: COLOR_FONDO
        } 
      }
    ],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      valign: 'middle',
    },
    head: [
      [
        { 
          content: 'ORDEN DEL DÍA', 
          colSpan: 2, 
          styles: { 
            halign: 'center', 
            fontStyle: 'bold', 
            fillColor: COLOR_TITULO,
            textColor: BLANCO,
            fontSize: 10
          } 
        }
      ]
    ],
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: contentWidth - 10 },
    },
    body: filasOrdenDia,
  });

  y = doc.lastAutoTable.finalY + 10;

  // ========================================================
  // TABLA 3: ACUERDOS Y COMPROMISOS
  // ========================================================
  const filasAcuerdos = (tareas || []).map((tarea, index) => {
    const contenido = [
      tarea.tar_nombre || '',
      tarea.tar_descripcion || '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const responsable =
      nombreCompleto({ nombre: tarea.usuario_nombre, apellido: tarea.usuario_apellido }) ||
      tarea.responsable ||
      '';

    return [
      { 
        content: String(index + 1), 
        styles: { 
          fillColor: COLOR_NUMEROS,
          halign: 'center', 
          fontStyle: 'bold',
          textColor: BLANCO
        } 
      },
      contenido,
      responsable,
      formatearFecha(tarea.tar_fecha),
    ];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      valign: 'middle',
    },
    head: [
      [
        { 
          content: '#', 
          styles: { 
            halign: 'center', 
            fillColor: COLOR_TITULO,
            textColor: BLANCO,
            fontStyle: 'bold'
          } 
        },
        { 
          content: 'ACUERDOS Y COMPROMISOS / TEMA', 
          styles: { 
            halign: 'center', 
            fillColor: COLOR_TITULO,
            textColor: BLANCO,
            fontStyle: 'bold'
          } 
        },
        { 
          content: 'RESPONSABLE / INVOLUCRADOS', 
          styles: { 
            halign: 'center', 
            fillColor: COLOR_TITULO,
            textColor: BLANCO,
            fontStyle: 'bold',
            fontSize: 7
          } 
        },
        { 
          content: 'FECHA FIN', 
          styles: { 
            halign: 'center', 
            fillColor: COLOR_TITULO,
            textColor: BLANCO,
            fontStyle: 'bold'
          } 
        },
      ],
    ],
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: contentWidth - 8 - 35 - 25 },
      2: { cellWidth: 35, halign: 'center' },
      3: { cellWidth: 25, halign: 'center' },
    },
    body: filasAcuerdos.length
      ? filasAcuerdos
      : [[{ content: 'Sin acuerdos registrados', colSpan: 4, styles: { halign: 'center' } }]],
    didParseCell: (data) => {
      if (data.column.index === 1 && data.cell.section === 'body') {
        data.cell.text = String(data.cell.raw).split('\n');
      }
    },
  });

  y = doc.lastAutoTable.finalY + 12;

  // ========================================================
  // TABLA 4: NOMBRE / FIRMA
  // ========================================================
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + 40 > pageHeight - margin) {
    doc.addPage();
    y = margin;
  }

  const filasFirma = (invitados || []).map((inv) => [nombreCompleto(inv.usuario || inv), '']);
  while (filasFirma.length < 6) filasFirma.push(['', '']);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      minCellHeight: 8,
    },
    head: [
      [
        { 
          content: 'NOMBRE', 
          styles: { 
            halign: 'center', 
            fillColor: COLOR_TITULO,
            textColor: BLANCO,
            fontStyle: 'bold'
          } 
        },
        { 
          content: 'FIRMA', 
          styles: { 
            halign: 'center', 
            fillColor: COLOR_TITULO,
            textColor: BLANCO,
            fontStyle: 'bold'
          } 
        },
      ],
    ],
    columnStyles: {
      0: { cellWidth: contentWidth * 0.65 },
      1: { cellWidth: contentWidth * 0.35 },
    },
    body: filasFirma,
  });

  // ========================================================
  // PIE DE PÁGINA
  // ========================================================
  const totalPaginas = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'italic');
    doc.text(`Página ${i} de ${totalPaginas}`, pageWidth - margin - 20, pageHeight - 6);
  }

  const nombreArchivo = `minuta_${reunion.reu_id || reunion.id || 'reunion'}_${Date.now()}.pdf`;
  doc.save(nombreArchivo);
};

// ============================================================
// Función para generar y descargar el PDF desde el componente
// ============================================================
export const descargarPDFReunion = async (reunionId, api) => {
  try {
    const reunionRes = await api.get(`/reuniones/${reunionId}`);
    let reunion, invitados;

    if (reunionRes.data.reunion) {
      reunion = reunionRes.data.reunion;
      invitados = reunionRes.data.invitados || [];
    } else {
      reunion = reunionRes.data;
      const invitadosRes = await api.get(`/reuniones/${reunionId}/invitados`);
      invitados = invitadosRes.data;
    }

    let tareas = [];
    try {
      const tareasRes = await api.get(`/tareas/reunion/${reunionId}`);
      tareas = tareasRes.data || [];
    } catch (err) {
      console.warn('No se pudieron cargar las tareas:', err);
    }

    generarPDFReunion(reunion, invitados, tareas);
  } catch (error) {
    console.error('Error al generar PDF:', error);
    throw error;
  }
};