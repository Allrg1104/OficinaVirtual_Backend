const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Role = require('../models/Role');
const User = require('../models/User');
const Program = require('../models/Program');
const Ips = require('../models/Ips');
const { connectDB } = require('../config/db');
const { logger } = require('../config/logger');

const seedDatabase = async () => {
  try {
    logger.info('Iniciando semilla de base de datos...');
    await connectDB();

    const rolesData = [
      {
        name: 'administrador',
        permissions: ['all_access', 'manage_users', 'view_audit_logs', 'export_reports'],
      },
      {
        name: 'autorizador',
        permissions: ['view_requests', 'approve_requests', 'reject_requests', 'request_more_info'],
      },
      {
        name: 'medico',
        permissions: ['create_requests', 'view_own_requests', 'add_own_attachments'],
      },
    ];

    const rolesMap = {};

    for (const r of rolesData) {
      let roleDoc = await Role.findOne({ name: r.name });
      if (!roleDoc) {
        roleDoc = await Role.create(r);
        logger.info(`Rol '${r.name}' creado.`);
      } else {
        roleDoc.permissions = r.permissions;
        await roleDoc.save();
        logger.info(`Rol '${r.name}' ya existía. Permisos actualizados.`);
      }
      rolesMap[r.name] = roleDoc.id;
    }

    const salt = await bcrypt.genSalt(10);

    const adminEmail = 'admin@oficinavirtual.com';
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      const passwordHash = await bcrypt.hash('Admin123*', salt);
      adminUser = await User.create({
        name: 'Administrador Oficina Virtual',
        document: '99999999',
        email: adminEmail,
        passwordHash,
        role: rolesMap['administrador'],
        status: 'active',
      });
      logger.info(`Usuario Administrador de prueba creado (${adminEmail} / Admin123*).`);
    } else {
      logger.info('Usuario Administrador ya existe.');
    }

    const medicoEmail = 'medico@oficinavirtual.com';
    let medicoUser = await User.findOne({ email: medicoEmail });
    if (!medicoUser) {
      const passwordHash = await bcrypt.hash('Medico123*', salt);
      medicoUser = await User.create({
        name: 'Dr. Alejandro Martínez',
        document: '11111111',
        email: medicoEmail,
        passwordHash,
        role: rolesMap['medico'],
        specialty: 'Cardiología Oncológica',
        ips: 'Clínica Sanitas del Norte',
        status: 'active',
      });
      logger.info(`Usuario Médico de prueba creado (${medicoEmail} / Medico123*).`);
    } else {
      logger.info('Usuario Médico ya existe.');
    }

    const autorizadorEmail = 'autorizador@oficinavirtual.com';
    let autorizadorUser = await User.findOne({ email: autorizadorEmail });
    if (!autorizadorUser) {
      const passwordHash = await bcrypt.hash('Autorizador123*', salt);
      autorizadorUser = await User.create({
        name: 'Dra. Patricia Restrepo',
        document: '22222222',
        email: autorizadorEmail,
        passwordHash,
        role: rolesMap['autorizador'],
        status: 'active',
      });
      logger.info(`Usuario Autorizador de prueba creado (${autorizadorEmail} / Autorizador123*).`);
    } else {
      logger.info('Usuario Autorizador ya existe.');
    }

    // Seed Programas
    const programsData = [
      'AMBULATORIO ESENCIAL',
      'AMBULATORIO ESPECIAL',
      'ASOCIADO',
      'CLASICO',
      'HOSPITALIZACION CIRUGIA MATERNIDAD',
      'ORO',
      'ORO PLUS',
      'ORO PRIME EMPRESARIAL',
      'PLATA',
      'PLATA JOVEN',
      'PLATA PRIME',
      'PREFERENTE',
      'TRADICIONAL',
      'TRADICIONAL ESPECIAL'
    ];

    for (const name of programsData) {
      let programDoc = await Program.findOne({ name });
      if (!programDoc) {
        await Program.create({ name, active: true });
        logger.info(`Programa '${name}' creado.`);
      }
    }

    // Seed IPS
    const ipsData = [
      { code: '1', name: 'BONSANA IPS SAS', abbreviation: 'BONSANA IPS SAS' },
      { code: '2', name: 'CHRISTUS SINERGIA CLINICA FARALLONES', abbreviation: 'CHRISTUS SIN' },
      { code: '3', name: 'CHRISTUS SINERGIA CLÍNICA PALMA REAL S.A.S.', abbreviation: 'CHRIST' },
      { code: '4', name: 'CLINICA BASILIA SA', abbreviation: 'CLINICA BASILIA SA' },
      { code: '5', name: 'CLINICA COLSANITAS S.A', abbreviation: 'CLINICA COLSANITAS S A' },
      { code: '6', name: 'CLÍNICA DE ALTA COMPLEJIDAD SANTA BÁRBARA S.A.S', abbreviation: 'CL' },
      { code: '7', name: 'CLINICA DE OCCIDENTE SA', abbreviation: 'CLINICA DE OCCIDENTE SA' },
      { code: '8', name: 'CLINICA IMBANACO S.A.S.', abbreviation: 'CLINICA IMBANACO S.A.S.' },
      { code: '9', name: 'CLINICA NUESTRA SEÑORA DE LOS REMEDIOS', abbreviation: 'CLINICA NUE' },
      { code: '10', name: 'CLINICA OFTALMOLOGICA DE CALI', abbreviation: 'CLINICA OFTALMOLOGIC' },
      { code: '11', name: 'CLINICA SAN FRANCISCO SA', abbreviation: 'CLINICA SAN FRANCISCO SA' },
      { code: '12', name: 'CLINICA SAN RAFAEL DE POPAYÁN SAS', abbreviation: 'CLINICA SAN RAFA' },
      { code: '13', name: 'COOMEVA EXPERIENCIA MEDICA SAS', abbreviation: 'CEM' },
      { code: '14', name: 'DIME CLINICA NEUROCARDIOVASCULAR', abbreviation: 'DIME CLINICA NEUR' },
      { code: '15', name: 'DUMIAN MEDICAL SAS', abbreviation: 'DUMIAN MEDICAL SAS' },
      { code: '16', name: 'FUNDACION CLINICA VALLE DEL LILI', abbreviation: 'FUNDACION CLINICA' },
      { code: '17', name: 'FUNDACION HOSPITAL SAN PEDRO', abbreviation: 'FUNDACION HOSPITAL SA' },
      { code: '18', name: 'HOSP UNIVERSITARIO SAN JOSE', abbreviation: 'HOSP UNIVERSITARIO SAN' },
      { code: '19', name: 'HOSPITAL DEPARTAMENTAL TOMAS URIBE URIBE DE TULUA E', abbreviation: 'HOSPITAL DEPARTAMENTAL TOMAS URIBE URIBE DE TULUA E' },
      { code: '20', name: 'HOSPITAL SAN JOSE DE BUGA', abbreviation: 'HOSPITAL SAN JOSE DE BUG' },
      { code: '21', name: 'HOSPITAL SUSANA LOPEZ', abbreviation: 'HOSPITAL SUSANA LOPEZ' },
      { code: '22', name: 'HOSPITAL UNIVERSITARIO DEPARTAMENTAL DE NARIÑO EMPR', abbreviation: 'HOSPITAL UNIVERSITARIO DEPARTAMENTAL DE NARIÑO EMPR' }
    ];

    for (const ips of ipsData) {
      let ipsDoc = await Ips.findOne({ code: ips.code });
      if (!ipsDoc) {
        await Ips.create({ ...ips, active: true });
        logger.info(`IPS '${ips.name}' creada con código ${ips.code}.`);
      }
    }

    logger.info('Semilla de base de datos completada exitosamente.');
    await mongoose.connection.close();
    logger.info('Conexión a MongoDB cerrada.');
    process.exit(0);

  } catch (error) {
    logger.error('Error durante la semilla de base de datos:', error);
    process.exit(1);
  }
};

seedDatabase();
