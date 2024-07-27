# Guía de Configuración y Creación de Base de Datos usando Docker

Esta guía proporciona instrucciones detalladas para configurar y crear una base de datos Cassandra utilizando Docker. A continuación, se describen los pasos necesarios para configurar un nodo semilla y nodos secundarios en Cassandra.

## Creación del Nodo Semilla y Nodos Secundarios

### 1. Creación del Nodo Semilla

Para crear el nodo semilla, es necesario habilitar los puertos requeridos para la comunicación entre los nodos. Utilice el siguiente comando para iniciar el contenedor de Docker:

```bash
docker run --name cass_semilla -p 9042:9042 -p 7000:7000 -p 7001:7001 -d cassandra
```

Este comando inicia un contenedor llamado `cass_semilla` con los puertos 9042, 7000 y 7001 expuestos.

### 2. Verificación del Nodo Semilla

Una vez que el nodo semilla esté en funcionamiento, es importante verificar su estado y obtener la dirección IP del nodo. Para ello, ingrese al contenedor del nodo semilla utilizando el siguiente comando:

```bash
docker exec -it cass_semilla bash
```

Dentro del contenedor, ejecute el siguiente comando para verificar el estado del nodo:

```bash
nodetool status
```

Anote la dirección IP del nodo semilla para usarla en la configuración de los nodos secundarios.

### 3. Creación de Nodos Secundarios

A continuación, procederemos a crear los nodos secundarios y los vincularemos al nodo semilla. Es recomendable tener al menos dos nodos secundarios. Los nodos secundarios se deben crear fuera del contenedor del nodo semilla. Utilice el siguiente comando para iniciar un nodo secundario:

```bash
docker run --name cass1 -d -e CASSANDRA_SEEDS="IP_del_nodo_semilla" cassandra
```

Reemplace `IP_del_nodo_semilla` con la dirección IP que anotó anteriormente.

### 4. Verificación de Nodos Secundarios

Para verificar que los nodos secundarios se han creado correctamente y están conectados al nodo semilla, puede ingresar al contenedor del nodo semilla y utilizar el siguiente comando:

```bash
nodetool status
```

Si se encuentra dentro de un contenedor que no es el nodo semilla y necesita identificar cuál es el nodo semilla, puede usar el siguiente comando:

```bash
nodetool getseeds
```

Este comando mostrará la dirección IP del nodo semilla.

---

## Creación de Keyspaces

A continuación, se detallan los pasos para crear un Keyspace en Cassandra:

### 1. Conexión al Nodo

Desde el sistema host, fuera de todos los contenedores, conéctese al nodo semilla utilizando el siguiente comando:

```bash
docker exec -it cass_semilla cqlsh
```

Este comando abrirá una sesión de `cqlsh`, la interfaz de línea de comandos para Cassandra.

### 2. Creación del Keyspace

Una vez conectado a `cqlsh`, ejecute el siguiente comando para crear un nuevo Keyspace:

```sql
CREATE KEYSPACE <nombre_del_keyspace> WITH replication = {
    'class': 'SimpleStrategy',
    'replication_factor': 1
};
```

Reemplace `<nombre_del_keyspace>` con el nombre deseado para su Keyspace. En este ejemplo, se utiliza la estrategia de replicación `SimpleStrategy` con un factor de replicación de 1, lo que significa que habrá una sola copia de los datos en el clúster.

### 3. Verificación de la Creación del Keyspace

Para verificar que el Keyspace se ha creado correctamente, ejecute el siguiente comando en `cqlsh`:

```sql
DESCRIBE KEYSPACES;
```

Este comando mostrará una lista de todos los Keyspaces disponibles en el clúster, incluyendo el nuevo Keyspace que ha creado.

---

## Creación de Tablas dentro del Keyspace

A continuación, se describen los pasos para crear tablas dentro de un Keyspace en Cassandra:

### 1. Conexión al Keyspace

Al igual que en el paso anterior para la creación del Keyspace, conéctese al nodo semilla utilizando `cqlsh` con el siguiente comando:

```bash
docker exec -it cass_semilla cqlsh
```

### 2. Selección del Keyspace

Una vez conectado a `cqlsh`, seleccione el Keyspace en el que desea crear las tablas. Ejecute el siguiente comando para usar el Keyspace:

```sql
USE <nombre_del_keyspace>;
```

Reemplace `<nombre_del_keyspace>` con el nombre del Keyspace que ha creado anteriormente.

### 3. Creación de Tablas

Una vez dentro del Keyspace, ejecute los siguientes comandos para crear las tablas:

```sql
CREATE TABLE matches_by_country (
    country TEXT,
    date DATE,
    home_team TEXT,
    away_team TEXT,
    home_score INT,
    away_score INT,
    tournament TEXT,
    city TEXT,
    neutral BOOLEAN,
    PRIMARY KEY ((country), date, home_team, away_team)
) WITH CLUSTERING ORDER BY (date DESC);

CREATE TABLE matches_by_tournament (
    tournament TEXT,
    date DATE,
    home_team TEXT,
    away_team TEXT,
    home_score INT,
    away_score INT,
    country TEXT,
    city TEXT,
    neutral BOOLEAN,
    PRIMARY KEY ((tournament), date, home_team, away_team)
) WITH CLUSTERING ORDER BY (date DESC);
```

Estas instrucciones crean dos tablas: `matches_by_country` y `matches_by_tournament`, cada una con sus respectivas columnas y claves primarias.

### 4. Verificación de la Creación de las Tablas

Para verificar que las tablas se han creado correctamente, puede utilizar los siguientes métodos:

- **Primera forma:** Listar todas las tablas en el Keyspace:

    ```sql
    DESCRIBE TABLES;
    ```

- **Segunda forma:** Filtrar y describir una tabla específica:

    ```sql
    DESCRIBE TABLE <nombre_de_la_tabla>;
    ```

    Reemplace `<nombre_de_la_tabla>` con el nombre de la tabla que desea verificar.

---

## Carga de Datos usando Driver para Leer Archivos

En esta sección, se describe el proceso para cargar datos en Cassandra utilizando Node.js y JavaScript (JS). Utilizaremos las dependencias `cassandra-driver` para la conexión a Cassandra y `xlsx` para leer archivos Excel.

### 1. Creación del Directorio e Instalación de Dependencias

Primero, cree un directorio para su proyecto y navegue hasta él en su terminal. Luego, instale las dependencias necesarias utilizando el siguiente comando:

```bash
npm install cassandra-driver xlsx
```

Este comando instalará `cassandra-driver` para interactuar con Cassandra y `xlsx` para leer datos de archivos Excel.

### 2. Ejecución del Script

Una vez instaladas las dependencias, ejecute el script `loadData.js` para cargar los datos en la base de datos Cassandra. Utilice el siguiente comando:

```bash
node loadData.js
```

Asegúrese de que el archivo `loadData.js` esté en el mismo directorio y contenga el código necesario para leer el archivo Excel y cargar los datos en Cassandra.
