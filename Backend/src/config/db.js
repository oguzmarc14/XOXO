import dns from 'node:dns';
import mongoose from 'mongoose';

dns.setServers([
  '8.8.8.8',
  '1.1.1.1'
]);

export const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGODB_URL;

    if (!mongoUrl) {
      throw new Error(
        'La variable MONGODB_URL no está definida en el archivo .env'
      );
    }

    const connection = await mongoose.connect(
      mongoUrl
    );

    console.log(
      `MongoDB conectado en: ${connection.connection.host}`
    );
  } catch (error) {
    console.error(
      'Error al conectar con MongoDB:',
      error
    );

    process.exit(1);
  }
};
