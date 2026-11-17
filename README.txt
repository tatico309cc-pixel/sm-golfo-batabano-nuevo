SM-GOLFO-BATABANÓ — paquete revisado

CONTENIDO
- index.html: interfaz principal
- styles.css: estilos adaptables a teléfono
- app.js: evaluación, almacenamiento local, respaldo e informe imprimible
- sw.js: caché offline del núcleo (caché v2)
- manifest.webmanifest: instalación como PWA
- iconos PNG

CAMBIOS DE ESTA REVISIÓN
- Mensaje visible que identifica los campos obligatorios del análisis.
- Confirmación explícita cuando una evaluación se guarda o cuando ocurre un error.
- Inicialización y manejo de errores del almacenamiento IndexedDB.
- Botón «Probar almacenamiento»: escribe, recupera y elimina inmediatamente un dato técnico temporal; no conserva registros de prueba.
- Actualización de caché del Service Worker, eliminando solo cachés anteriores cuyo nombre comienza por «sm-golfo-shell-».

INSTALACIÓN / ACTUALIZACIÓN
1. Conserve el respaldo JSON de la aplicación anterior antes de sustituir archivos.
2. Sustituya en la raíz del repositorio los archivos del paquete por los de esta revisión.
3. Espere a que GitHub Pages publique los cambios.
4. Abra la aplicación con Internet y recargue.
5. En «Registros», pulse «Probar almacenamiento» y compruebe el resultado.
6. Después, realice una evaluación con datos oficiales y límites aprobados para verificar el guardado real.
7. Exporte un respaldo JSON y guárdelo fuera del navegador.

LIMITACIONES QUE SE MANTIENEN
- Los límites de viento/olas y calados no están precargados: deben introducirse desde la documentación oficial aplicable.
- El informe se genera en formato imprimible desde el navegador; todavía no genera DOCX automáticamente.
- Los datos meteorológicos se introducen manualmente; no descarga pronósticos automáticamente.
- La sincronización automática entre dispositivos o con un servidor no está implementada.
- La evaluación no sustituye la decisión de la Administración ni del Capitán.
