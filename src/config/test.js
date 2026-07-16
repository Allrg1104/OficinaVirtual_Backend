/**
 * DIAGNÓSTICO DE CONEXIÓN A MONGODB ATLAS
 * Corre con: node src/config/test.js
 */

const mongoose = require("mongoose");

// Los hosts reales resueltos del SRV (cluster0.xtqyw.mongodb.net)
const DIRECT_URI = "mongodb://allrg1104:odZrI0xwsjhSq5UC@cluster0-shard-00-00.xtqyw.mongodb.net:27017,cluster0-shard-00-01.xtqyw.mongodb.net:27017,cluster0-shard-00-02.xtqyw.mongodb.net:27017/BD_OfVirtual?authSource=admin&replicaSet=atlas-13lfgo&ssl=true&appName=Cluster0";

const SRV_URI = "mongodb+srv://allrg1104:odZrI0xwsjhSq5UC@cluster0.xtqyw.mongodb.net/BD_OfVirtual?appName=Cluster0";
//const SRV_URI = "mongodb+srv://allrg1104:odZrI0xwsjhSq5UC@cluster0.xtqyw.mongodb.net/BD_OfVirtual?retryWrites=true&w=majority&appName=Cluster0";

async function testConnection(label, uri) {
    console.log(`\n🔌 Probando [${label}]...`);
    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 8000,
            connectTimeoutMS: 10000,
        });
        console.log(`✅ [${label}] CONECTADO correctamente a MongoDB Atlas`);
        console.log(`   Base de datos: ${mongoose.connection.db.databaseName}`);
        await mongoose.disconnect();
        return true;
    } catch (err) {
        console.error(`❌ [${label}] FALLÓ:`, err.message);
        try { await mongoose.disconnect(); } catch (_) { }
        return false;
    }
}

async function run() {
    console.log("====================================");
    console.log(" DIAGNÓSTICO DE CONEXIÓN MONGODB   ");
    console.log("====================================");

    // Intento 1: SRV (modo normal)
    const srvOk = await testConnection("SRV (+srv)", SRV_URI);
    if (srvOk) {
        console.log("\n🎉 Usa el SRV_URI en tu .env — todo funciona.");
        process.exit(0);
    }

    // Intento 2: hosts directos (bypass SRV DNS)
    const directOk = await testConnection("DIRECTO (hosts explícitos)", DIRECT_URI);
    if (directOk) {
        console.log("\n✅ La conexión DIRECTA funciona.");
        console.log("⚠️  El SRV DNS está bloqueado en esta red.");
        console.log("📋 Cambia en .env la MONGODB_URI por esta URL directa:");
        console.log("\n" + DIRECT_URI + "\n");
        process.exit(0);
    }

    console.log("\n💀 Ninguna conexión funcionó.");
    console.log("🔒 El puerto 27017 está bloqueado en esta red.");
    console.log("   Soluciones:");
    console.log("   1. Conectarte a una red diferente (hotspot móvil)");
    console.log("   2. Usar una VPN");
    console.log("   3. Agregar tu IP en MongoDB Atlas > Network Access");
    process.exit(1);
}

run();