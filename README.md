# CashTrackr Backend

## 🚀 Overview

CashTrackr es un sistema moderno de gestión financiera desarrollado con Node.js y TypeScript.

## 📋 Prerequisites

- Node.js (v18 o superior)
- npm o yarn
- PostgreSQL
- Redis (opcional, para caché)

## 🛠️ Installation

1. Clona el repositorio:
   ```sh
   git clone https://github.com/tuusuario/cashtrackr.git
   ```
2. Accede al directorio del proyecto:
   ```sh
   cd cashtrackr
   ```
3. Instala las dependencias:
   ```sh
   npm install  # o yarn install
   ```

## 🔧 Configuration

Crea un archivo `.env` en el directorio raíz con las siguientes variables:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=cashtrackr
JWT_SECRET=tu_secreto
REDIS_URL=redis://localhost:6379 # Opcional
```

## 🏃‍♂️ Running the Application

Para iniciar la aplicación en modo desarrollo:

```sh
npm run dev  # o yarn dev
```

Para iniciar en producción:

```sh
npm start  # o yarn start
```

## 🧪 Testing

Ejecuta las pruebas con:

```sh
npm test  # o yarn test
```

## 🏗️ Project Structure

```
/cashtrackr
│── src
│   ├── config
│   ├── controllers
│   ├── data
│   ├── email
│   ├── middlewares
│   ├── models
│   ├── routes
│   ├── utils
│── package.json
│── README.md
```

## 🔐 Security

- Autenticación con JWT
- Limitación de tasa de peticiones
- Validación de entrada
- Cifrado de datos

## 📜 License

Este proyecto está licenciado bajo la MIT License - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Contributors

- **Tu Nombre** - Trabajo inicial - [TuGitHub](https://github.com/tuusuario)

## 🤝 Contributing

1. Realiza un fork del proyecto
2. Crea tu rama de funcionalidad (`git checkout -b feature/AmazingFeature`)
3. Realiza tus cambios y confírmalos (`git commit -m 'Add some AmazingFeature'`)
4. Envía tus cambios (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

¡Gracias por contribuir a CashTrackr! 🚀
