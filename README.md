# 🚀 Proyecto de Gestión de Proyectos

Aplicación de ejemplo construida con **Next.js (App Router)**, **Material UI (MUI v6)**, **Axios** y **json-server** como backend mock.

## 📦 Requisitos previos

- Node.js **≥18**
- npm o pnpm o yarn (ejemplos con `npm`)
- json-server instalado localmente (se instala con el proyecto)

---

## ⚙️ Instalación

Clona este repositorio y entra a la carpeta:

```bash
git clone <URL_DEL_REPO>
cd <NOMBRE_DEL_PROYECTO>
Instala dependencias:



npm install
▶️ Correr el proyecto
1. Iniciar la API fake (json-server)
El backend mock está configurado en db.json y corre en el puerto 4000:


npx json-server --watch db.json --port 4000
Endpoint de usuarios: http://localhost:4000/users

Endpoint de proyectos: http://localhost:4000/projects


2. Corrrer aplicacion de next
npm run dev

Usuarios de prueba

{
  "username": "admin",
  "password": "admin123",
}
{
  "username": "project-manager",
  "password": "pm123",
}
```
