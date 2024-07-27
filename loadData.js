const { Client } = require('cassandra-driver');
const XLSX = require('xlsx');
const path = require('path');

// Configuración de Cassandra
const client = new Client({
  contactPoints: ['localhost'], // Cambia a 'localhost' si el contenedor está en la misma máquina
  localDataCenter: 'datacenter1', // Cambia al nombre de tu datacenter
  keyspace: 'prueba1' // Cambia al nombre de tu keyspace
});

// Leer el archivo Excel
const filePath = path.join(__dirname, './data/results.xlsx');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// Insertar datos en Cassandra
const insertMatchByCountry = 'INSERT INTO matches_by_country (country, date, home_team, away_team, home_score, away_score, tournament, city, neutral) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
const insertMatchByTournament = 'INSERT INTO matches_by_tournament (tournament, date, home_team, away_team, home_score, away_score, country, city, neutral) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

async function insertData() {
  console.log('Conectando a la base de datos...');
  const startTime = Date.now();

  try {
    await client.connect();
    console.log('Conexión a la base de datos establecida.');
    console.log('Realizando carga de datos, espere por favor...');

    // Saltar la fila de encabezado
    for (let i = 1; i < data.length; i++) {
      const [date, home_team, away_team, home_score, away_score, tournament, city, country, neutral] = data[i];

      // Insertar en matches_by_country
      await client.execute(insertMatchByCountry, [country, new Date(date), home_team, away_team, home_score, away_score, tournament, city, neutral === 'TRUE'], { prepare: true });

      // Insertar en matches_by_tournament
      await client.execute(insertMatchByTournament, [tournament, new Date(date), home_team, away_team, home_score, away_score, country, city, neutral === 'TRUE'], { prepare: true });
    }

    const endTime = Date.now();
    console.log('Datos insertados exitosamente.');
    console.log(`Tiempo total empleado: ${endTime - startTime} ms`);
  } catch (error) {
    console.error('Error al insertar datos:', error);
  } finally {
    await client.shutdown();
    console.log('Conexión a la base de datos cerrada.');
  }
}

insertData();
