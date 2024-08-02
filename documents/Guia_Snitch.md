# Guía de Configuración de Snitch en CassandraDB con Docker

Este documento proporciona una guía paso a paso para crear y modificar la configuración de snitch en un contenedor de CassandraDB usando Docker.

## Prerrequisitos

- Docker instalado y funcionando en tu máquina.

## Paso 1: Crear un Volumen para Cassandra

Primero, crea un volumen de Docker para almacenar la configuración y los datos de Cassandra:

```bash
docker volume create cassandra1
```

## Paso 2: Crear un Nodo Semilla

Inicia un contenedor de Cassandra con el volumen creado y expón los puertos necesarios:

```bash
docker run --name cass_semilla -p 9042:9042 -p 7000:7000 -p 7001:7001 -v cassandra1:/etc/cassandra -d cassandra
```

## Paso 3: Verificar el Contenedor

Asegúrate de que el contenedor esté corriendo:

```bash
docker ps
```

## Paso 4: Configuración del Snitch

1. **Acceder al Volumen de Docker**

   Navega al directorio del volumen de Docker. En sistemas Windows, la ruta generalmente es:

   ```plaintext
   docker-desktop-data\data\docker\volumes
   ```

   En sistemas basados en Unix, puedes encontrarlo en `/var/lib/docker/volumes`.

   Ingresa al volumen correspondiente (`cassandra1` en este caso).

2. **Modificar `cassandra.yaml`**

   Abre el archivo `cassandra.yaml` con un editor de texto y localiza la línea que contiene `endpoint_snitch`. Cambia el valor de `SimpleSnitch` a `GossipingPropertyFileSnitch`:

   ```yaml
   endpoint_snitch: GossipingPropertyFileSnitch
   ```

   Guarda y cierra el archivo.

3. **Actualizar `cassandra-env.sh`**

   Abre el archivo `cassandra-env.sh` con un editor de texto. Ve al final del documento y añade la siguiente línea:

   ```bash
   JVM_OPTS="$JVM_OPTS -Dcassandra.ignore_dc=true -Dcassandra.ignore_rack=true"
   ```

   Además, reemplaza la línea:

   ```bash
   JVM_OPTS="$JVM_OPTS $JVM_EXTRA_OPTS"
   ```

   Por:

   ```bash
   # JVM_OPTS="$JVM_OPTS $JVM_EXTRA_OPTS"
   ```

   Guarda y cierra el archivo.

4. **Modificar `cassandra-rackdc.properties`**

   Abre el archivo `cassandra-rackdc.properties` con un editor de texto. Cambia las líneas:

   ```properties
   dc=dc1
   rack=rack1
   ```

   Por los nombres deseados para el datacenter y el rack. Por ejemplo:

   ```properties
   dc=UCE
   rack=LAB1
   ```

   Guarda y cierra el archivo.

## Paso 5: Reiniciar el Contenedor

Reinicia el contenedor para aplicar los cambios:

```bash
docker restart cass_semilla
```

## Paso 6: Verificar la Configuración

Entra al contenedor y verifica el estado de los nodos:

```bash
docker exec -it cass_semilla bash
nodetool status
```

#### 7. Creación de Nodos Secundarios

Para crear nodos secundarios, sigue los mismos pasos que para el nodo semilla pero con diferentes nombres y volúmenes.

1. **Crear un Volumen para cada Nodo Secundario**

   ```bash
   docker volume create cassandra2
   docker volume create cassandra3
   ```

2. **Iniciar Contenedores para los Nodos Secundarios**

   ```bash
   docker run --name cass1 -p 9043:9042 -p 7002:7000 -p 7003:7001 -v cassandra2:/etc/cassandra -e CASSANDRA_SEEDS="IP_del_nodo_semilla" -d cassandra
   docker run --name cass2 -p 9044:9042 -p 7004:7000 -p 7005:7001 -v cassandra3:/etc/cassandra -e CASSANDRA_SEEDS="IP_del_nodo_semilla" -d cassandra
   ```

3. **Configurar el Snitch en los Nodos Secundarios**

   Navega al volumen de cada nodo secundario (`cassandra2`, `cassandra3`, etc.) y repite los pasos de configuración del snitch:

   - Modifica `cassandra.yaml` para usar `GossipingPropertyFileSnitch`.
   - Actualiza `cassandra-env.sh` para añadir las opciones JVM.
   - Modifica `cassandra-rackdc.properties` para que el datacenter sea `UCE` y el rack sea diferente para cada nodo (por ejemplo, `LAB2`, `LAB3`).

4. **Reiniciar los Nodos Secundarios**

   ```bash
   docker restart cass1
   docker restart cass2
   ```

5. **Verificación de Nodos Secundarios**

   Verifica el estado de los nodos secundarios:

   ```bash
   docker exec -it cass1 bash
   nodetool status

   docker exec -it cass2 bash
   nodetool status
   ```

### Creación de Keyspaces y Tablas

Sigue los pasos de la guía original para crear Keyspaces y tablas, conectándote al nodo semilla mediante `cqlsh`.

### Carga de Datos usando Driver para Leer Archivos

Sigue los pasos de la guía original para cargar datos en Cassandra utilizando Node.js y las dependencias `cassandra-driver` y `xlsx`.

### Conclusión

Siguiendo estos pasos, puedes configurar un clúster de CassandraDB utilizando Docker con la configuración de snitch adecuada. Si tienes alguna duda o encuentras algún problema, no dudes en preguntar.