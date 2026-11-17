SM-GOLFO-BATABANO - REVISION 2 / FORMULARIO MULTIZONA

CONTENIDO
- index.html: interfaz y formulario de evaluación por zonas.
- styles.css: presentación adaptable a teléfonos y computadoras.
- app.js: evaluación individual por zona, conclusión conjunta y almacenamiento local.
- sw.js: caché de la aplicación para funcionamiento sin conexión.
- manifest.webmanifest: configuración de instalación PWA.
- sectorizacion.jpg: imagen de referencia aportada por el usuario.
- icon-192.png e icon-512.png: iconos de la aplicación.

CAMBIOS DE ESTA REVISIÓN
- Sustituye el campo de sector único por selección múltiple de A, B, C, D y F.
- No crea ni muestra un sector E.
- Los datos de viento, dirección, oleaje, límites y observaciones se introducen por separado para cada zona.
- Añade fecha/hora de emisión y período de validez del pronóstico.
- Presenta resultados por zona y una conclusión conjunta.
- Conserva IndexedDB y el nombre de la base de datos existentes para mantener los registros guardados en este dispositivo.
- Mantiene compatibilidad de lectura y visualización de registros de la versión anterior.
- Incluye el mapa de referencia en la caché offline.

IMPORTANTE
La sectorización es aproximada y representa zonas de referencia, no polígonos ni límites geográficos definidos por coordenadas. Los límites operacionales deben introducirse por zona conforme a los criterios oficiales aplicables al buque y a la operación. No se precargan valores normativos.

Esta revisión todavía debe probarse en el navegador antes de sustituir los archivos publicados. No elimina los datos almacenados localmente, pero se recomienda exportar un respaldo JSON antes de actualizar.

INSTALACIÓN EN GITHUB PAGES
1. Descargue y extraiga el ZIP.
2. En el repositorio sm-golfo-batabano-nuevo, cargue los archivos de esta carpeta en la raíz, reemplazando los archivos de igual nombre.
3. Añada sectorizacion.jpg como archivo nuevo.
4. Confirme los cambios en la rama main.
5. Abra la aplicación publicada con conexión y recárguela. Espere a que el navegador actualice el Service Worker.
6. Compruebe Análisis, Registros, Configuración y modo sin conexión.

No elimine el repositorio ni borre datos del navegador.
