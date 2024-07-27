const { Client } = require('cassandra-driver');

const client = new Client({
  contactPoints: ['localhost'], // Cambia a las IPs de tus nodos
  localDataCenter: 'datacenter1', // Cambia al nombre de tu datacenter
  keyspace: 'prueba1' // Cambia al nombre de tu keyspace
});

async function testConnection() {
  try {
    await client.connect();
    const result = await client.execute('SELECT release_version FROM system.local');
    console.log('Cassandra Version:', result.rows[0].release_version);
  } catch (error) {
    console.error('Error al conectar:', error);
  } finally {
    await client.shutdown();
  }
}

testConnection();
