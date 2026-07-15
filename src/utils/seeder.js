const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Role = require('../models/Role');
const User = require('../models/User');
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
