const ExcelJS = require('exceljs');
const Request = require('../models/Request');

class ReportService {
  async exportToExcel(filters) {
    const query = this.buildFilterQuery(filters);
    const requests = await Request.find(query).sort({ createdAt: -1 }).populate('doctor');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Oficina Virtual Médica';
    workbook.lastModifiedBy = 'Oficina Virtual';
    
    const worksheet = workbook.addWorksheet('Solicitudes de Autorización');

    worksheet.mergeCells('A1:Q2');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Reporte de Solicitudes de Autorización de Procedimientos de Alto Costo';
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFF' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1E3A8A' }
    };

    worksheet.mergeCells('A3:Q3');
    const subtitleCell = worksheet.getCell('A3');
    subtitleCell.value = `Exportado el: ${new Date().toLocaleString()} | Filtros aplicados: ${JSON.stringify(filters)}`;
    subtitleCell.font = { name: 'Arial', size: 10, italic: true };
    subtitleCell.alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.addRow([]);

    const headers = [
      'ID Solicitud',
      'Fecha Creación',
      'Estado',
      'Nombre Médico',
      'Doc Médico',
      'Especialidad',
      'IPS',
      'Nombre Paciente',
      'Doc Paciente',
      'Fecha Nac. Paciente',
      'Sexo Paciente',
      'Código CIE10',
      'Diagnóstico',
      'Código CUPS',
      'Procedimiento',
      'Justificación',
      'Última Observación'
    ];

    const headerRow = worksheet.addRow(headers);
    headerRow.height = 25;
    
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '2563EB' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'medium' },
        right: { style: 'thin' }
      };
    });

    requests.forEach((req) => {
      const lastObs = req.observations.length > 0 
        ? req.observations[req.observations.length - 1].text 
        : 'Sin observaciones';

      const rowData = [
        req.id.toString(),
        req.createdAt.toISOString().substring(0, 10),
        req.status.replace('_', ' ').toUpperCase(),
        req.doctorSnapshot.name,
        req.doctorSnapshot.document,
        req.doctorSnapshot.specialty || 'N/A',
        req.doctorSnapshot.ips || 'N/A',
        req.patient.name,
        req.patient.document,
        req.patient.birthDate.toISOString().substring(0, 10),
        req.patient.gender,
        req.medicalInfo.cie10Code,
        req.medicalInfo.diagnosis,
        req.medicalInfo.cupsCode,
        req.medicalInfo.procedure,
        req.medicalInfo.justification,
        lastObs
      ];

      const row = worksheet.addRow(rowData);
      row.height = 20;

      const statusCell = row.getCell(3);
      let statusColor = '000000';
      let statusBg = 'FFFFFF';
      switch (req.status) {
        case 'pendiente':
          statusBg = 'FEF3C7';
          statusColor = '92400E';
          break;
        case 'en_revision':
          statusBg = 'DBEAFE';
          statusColor = '1E40AF';
          break;
        case 'aprobada':
          statusBg = 'D1FAE5';
          statusColor = '065F46';
          break;
        case 'rechazada':
          statusBg = 'FEE2E2';
          statusColor = '991B1B';
          break;
        case 'informacion_adicional':
          statusBg = 'F3E8FF';
          statusColor = '6B21A8';
          break;
      }
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: statusBg }
      };
      statusCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: statusColor } };
      statusCell.alignment = { vertical: 'middle', horizontal: 'center' };

      row.eachCell((cell) => {
        if (cell.col !== 3) {
          cell.font = { name: 'Arial', size: 10 };
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
        cell.border = {
          top: { style: 'thin', color: { argb: 'E5E7EB' } },
          left: { style: 'thin', color: { argb: 'E5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
          right: { style: 'thin', color: { argb: 'E5E7EB' } }
        };
      });
    });

    worksheet.columns.forEach((column) => {
      let maxLen = 0;
      column.eachCell((cell, rowNumber) => {
        if (rowNumber > 3) {
          const val = cell.value ? cell.value.toString() : '';
          maxLen = Math.max(maxLen, val.length);
        }
      });
      column.width = Math.max(maxLen + 4, 12);
    });

    worksheet.getColumn(13).width = 30;
    worksheet.getColumn(15).width = 30;
    worksheet.getColumn(16).width = 40;
    worksheet.getColumn(17).width = 45;

    return await workbook.xlsx.writeAsBuffer();
  }

  buildFilterQuery(filters) {
    const query = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.doctor) {
      query.doctor = filters.doctor;
    }

    if (filters.specialty) {
      query['doctorSnapshot.specialty'] = { $regex: filters.specialty, $options: 'i' };
    }

    if (filters.patientDoc) {
      query['patient.document'] = filters.patientDoc;
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    return query;
  }
}

const reportService = new ReportService();
module.exports = { ReportService, reportService };
