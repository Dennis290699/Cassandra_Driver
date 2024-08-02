const { Client } = require('cassandra-driver');

// Configuración de Cassandra
const client = new Client({
  contactPoints: ['localhost'], // Cambia a 'localhost' si el contenedor está en la misma máquina
  localDataCenter: 'datacenter1', // Cambia al nombre de tu datacenter
  keyspace: 'prueba1' // Cambia al nombre de tu keyspace
});

// Instrucciones para eliminar las tablas
const dropTableMatchesByCountry = 'DROP TABLE IF EXISTS matches_by_country';
const dropTableMatchesByTournament = 'DROP TABLE IF EXISTS matches_by_tournament';

async function dropTables() {
  console.log('Conectando a la base de datos...');
  try {
    await client.connect();
    console.log('Conexión a la base de datos establecida.');

    console.log('Eliminando tablas...');
    await client.execute(dropTableMatchesByCountry);
    await client.execute(dropTableMatchesByTournament);
    console.log('Tablas eliminadas exitosamente.');
  } catch (error) {
    console.error('Error al eliminar tablas:', error);
  } finally {
    await client.shutdown();
    console.log('Conexión a la base de datos cerrada.');
  }
}

dropTables();
