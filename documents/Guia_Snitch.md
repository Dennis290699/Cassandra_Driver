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

## Conclusión

Ahora tu contenedor de CassandraDB está configurado con el snitch adecuado y listo para su uso. Puedes proceder con la configuración y administración de tu clúster Cassandra según la guía principal.

### Notas: 
Tenga en cuenta que si creas otro nodo y lo quieres en un rack distinto tienes que volver a poner la sentencia y la configuracion pero ahora solo cambias el rack