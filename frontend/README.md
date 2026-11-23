# Retazo — Frontend (React Native + Expo)

App móvil de Retazo. Consume la API de [`../backend`](../backend/README.md); las instrucciones completas están en el [README principal](../README.md).

```powershell
cd frontend
npm install
npx expo start      # QR para Expo Go · "a" emulador Android · "w" navegador
```

La dirección del backend se detecta sola (IP del computador que corre Expo, puerto 8080). Para fijarla, crea `frontend/.env` con `EXPO_PUBLIC_API_URL=http://<IP>:8080`.

Funcionalidades principales: inicio de sesión y registro (persona u organización con documento), lugares cercanos según la ubicación, búsqueda con filtro por periodo, ficha del lugar, comparación antes/después, historia con el **asistente "Pregúntale a la historia" (RAG)**, favoritos, perfil y, para organizaciones, **agregar lugares** con fotos subidas al servidor.
